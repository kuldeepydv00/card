const User = require('../models/User');
const Bet = require('../models/Bet');
const HourlyResult = require('../models/HourlyResult');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const DepositRequest = require('../models/DepositRequest');
const AdminLog = require('../models/AdminLog');
const { updateBalance } = require('../services/walletService');
const { processHourlyResult } = require('../services/resultProcessor');
const Setting = require('../models/Setting');
const { getIo } = require('../config/socket');

const logAdminAction = async (adminId, action, targetId, targetModel, details, req) => {
  try {
    await AdminLog.create({
      admin_id: adminId,
      action,
      target_id: targetId,
      target_model: targetModel,
      details,
      ip_address: req.ip
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBets = await Bet.countDocuments();
    const totalVolume = await Bet.aggregate([{ $group: { _id: null, total: { $sum: "$bet_amount" } } }]);
    
    res.json({
      totalUsers,
      totalBets,
      totalVolume: totalVolume[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getGameStatus = async (req, res) => {
  try {
    const gameModeSetting = await Setting.findOne({ key: 'game_mode' });
    const gameMode = gameModeSetting?.value || 'auto';

    const pendingSlots = await Bet.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: '$hour_slot' } },
      { $sort: { _id: 1 } } // Earliest pending first
    ]);

    let pendingRound = null;
    if (pendingSlots.length > 0) {
      const hourSlot = pendingSlots[0]._id;
      
      const cards = await Bet.aggregate([
        { $match: { hour_slot: hourSlot, status: 'pending' } },
        { $group: {
          _id: '$card_code',
          totalAmount: { $sum: '$bet_amount' },
          betCount: { $sum: 1 }
        }}
      ]);
      
      const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      const SUITS = ['H', 'D', 'C', 'S'];
      const ALL_CARDS = RANKS.flatMap(rank => SUITS.map(suit => `${rank}${suit}`));
      
      const fullCards = ALL_CARDS.map(card => {
        const found = cards.find(c => c._id === card);
        return found || { _id: card, totalAmount: 0, betCount: 0 };
      }).sort((a, b) => a.totalAmount - b.totalAmount);
      
      const totalVolume = fullCards.reduce((s, c) => s + c.totalAmount, 0);

      pendingRound = {
        hourSlot,
        cards: fullCards,
        totalVolume
      };
    }

    res.json({ gameMode, pendingRound });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPendingWithdrawals = async (req, res) => {
  try {
    const requests = await WithdrawalRequest.find({ status: 'pending' })
      .populate('user_id', 'username email wallet_balance')
      .sort({ requested_at: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllWithdrawals = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const User = require('../models/User');
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      });
      const userIds = users.map(u => u._id);
      query.user_id = { $in: userIds };
    }

    const requests = await WithdrawalRequest.find(query)
      .populate('user_id', 'username email phone wallet_balance')
      .sort({ requested_at: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await WithdrawalRequest.findById(id);
    
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // We no longer deduct here because it was deducted at request time!
    request.status = 'approved';
    request.processed_at = new Date();
    await request.save();

    await logAdminAction(req.user.id, 'APPROVE_WITHDRAWAL', request._id, 'WithdrawalRequest', { amount: request.amount }, req);

    res.json({ message: 'Withdrawal approved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const rejectWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    
    const request = await WithdrawalRequest.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Refund the deducted amount back to the user
    await updateBalance(
      request.user_id,
      request.amount,
      'deposit', // Or 'refund' type
      request._id.toString(),
      `Withdrawal rejected: ${remarks}`
    );

    request.status = 'rejected';
    request.admin_remarks = remarks;
    request.processed_at = new Date();
    await request.save();

    await logAdminAction(req.user.id, 'REJECT_WITHDRAWAL', request._id, 'WithdrawalRequest', { remarks }, req);

    res.json({ message: 'Withdrawal rejected & amount refunded' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDeposits = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const User = require('../models/User');
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      });
      const userIds = users.map(u => u._id);
      query.user_id = { $in: userIds };
    }

    const requests = await DepositRequest.find(query)
      .populate('user_id', 'username email phone wallet_balance')
      .sort({ requested_at: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const approveDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await DepositRequest.findById(id);
    
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Credit user's wallet
    await updateBalance(
      request.user_id,
      request.amount,
      'deposit',
      request._id.toString(),
      `Deposit approved (UTR: ${request.utr_number})`
    );

    request.status = 'approved';
    request.processed_at = new Date();
    await request.save();

    await logAdminAction(req.user.id, 'APPROVE_DEPOSIT', request._id, 'DepositRequest', { amount: request.amount, utr: request.utr_number }, req);

    res.json({ message: 'Deposit approved and wallet credited' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    
    const request = await DepositRequest.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    request.status = 'rejected';
    request.admin_remarks = remarks;
    request.processed_at = new Date();
    await request.save();

    await logAdminAction(req.user.id, 'REJECT_DEPOSIT', request._id, 'DepositRequest', { remarks, utr: request.utr_number }, req);

    res.json({ message: 'Deposit rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const overrideResult = async (req, res) => {
  try {
    const { hourSlot, winningCard } = req.body;
    const slotDate = new Date(hourSlot);
    
    const now = new Date();
    const overrideWindowMinutes = (await Setting.findOne({ key: 'override_window_minutes' }))?.value || 10;
    const bettingCloseMinute = (await Setting.findOne({ key: 'betting_close_minute' }))?.value || 50;
    
    // Window opens at hourSlot + bettingCloseMinute
    const windowStart = new Date(slotDate);
    windowStart.setMinutes(parseInt(bettingCloseMinute));

    if (now < windowStart) {
      return res.status(403).json({ error: 'Manual declaration window has not opened yet (betting still active)' });
    }

    const result = await processHourlyResult(slotDate, winningCard, req.user.id);
    
    // Notify users
    const io = getIo();
    if (io) {
      io.emit('result_declared', {
        hourSlot: slotDate,
        winningCard: result.winning_card
      });
    }

    await logAdminAction(req.user.id, 'OVERRIDE_RESULT', null, 'HourlyResult', { hourSlot, winningCard }, req);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBetAggregation = async (req, res) => {
  try {
    const { hourSlot } = req.params;
    const slotDate = new Date(hourSlot);

    const aggregation = await Bet.aggregate([
      { $match: { hour_slot: slotDate } },
      { $group: { _id: "$card_code", total: { $sum: "$bet_amount" } } },
      { $sort: { total: 1 } }
    ]);

    res.json(aggregation);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllBetsBreakdown = async (req, res) => {
  try {
    const { limit = 24 } = req.query;

    // Get unique recent hour slots
    const slots = await Bet.aggregate([
      { $group: { _id: '$hour_slot' } },
      { $sort: { _id: -1 } },
      { $limit: parseInt(limit) }
    ]);

    const results = [];
    for (const slot of slots) {
      const cards = await Bet.aggregate([
        { $match: { hour_slot: slot._id } },
        { $group: {
          _id: '$card_code',
          totalAmount: { $sum: '$bet_amount' },
          betCount: { $sum: 1 }
        }},
        { $sort: { totalAmount: 1 } }
      ]);

      const totalVolume = cards.reduce((s, c) => s + c.totalAmount, 0);
      const totalBets = cards.reduce((s, c) => s + c.betCount, 0);

      // Find declared winner for this slot
      const hourlyResult = await HourlyResult.findOne({ hour_slot: slot._id });

      results.push({
        hour_slot: slot._id,
        cards,
        totalVolume,
        totalBets,
        winning_card: hourlyResult?.winning_card || null,
        is_processed: hourlyResult?.is_processed || false
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSettings = async (req, res) => {
  try {
    const settings = await Setting.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body; // Array of { key, value }
    for (const item of settings) {
      await Setting.findOneAndUpdate(
        { key: item.key },
        { value: item.value },
        { upsert: true }
      );
    }
    res.json({ message: 'Settings synchronized successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Configuration sync failed' });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const searchFilter = { role: 'user' };
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      searchFilter.$or = [
        { username: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    const users = await User.find(searchFilter).sort({ created_at: -1 });
    const userIds = users.map(u => u._id);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch bets in the last 30 days
    const bets = await Bet.find({
      user_id: { $in: userIds },
      created_at: { $gte: thirtyDaysAgo }
    }).select('user_id created_at');

    // Group bets by user
    const betsByUser = {};
    userIds.forEach(id => {
      betsByUser[id.toString()] = [];
    });
    bets.forEach(bet => {
      const uidStr = bet.user_id.toString();
      if (betsByUser[uidStr]) {
        betsByUser[uidStr].push(bet);
      }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const usersWithStatus = users.map(user => {
      const userBets = betsByUser[user._id.toString()] || [];
      const uniqueDays = new Set(userBets.map(b => new Date(b.created_at).toDateString()));
      const activeDaysCount = uniqueDays.size;

      const uniqueDaysLast7 = new Set(
        userBets
          .filter(b => new Date(b.created_at) >= sevenDaysAgo)
          .map(b => new Date(b.created_at).toDateString())
      );
      const activeDaysLast7 = uniqueDaysLast7.size;

      let engagementStatus = 'inactive';
      if (activeDaysLast7 >= 5 || activeDaysCount >= 15) {
        engagementStatus = 'daily';
      } else if (activeDaysCount >= 4) {
        engagementStatus = 'weekly';
      } else if (activeDaysCount >= 1) {
        engagementStatus = 'monthly';
      }

      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        wallet_balance: user.wallet_balance,
        is_active: user.is_active,
        created_at: user.created_at,
        engagement_status: engagementStatus
      };
    });

    res.json(usersWithStatus);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAdminUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Calculate engagement status
    const userBetsHistory = await Bet.find({
      user_id: user._id,
      created_at: { $gte: thirtyDaysAgo }
    }).select('created_at');

    const uniqueDays = new Set(userBetsHistory.map(b => new Date(b.created_at).toDateString()));
    const activeDaysCount = uniqueDays.size;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const uniqueDaysLast7 = new Set(
      userBetsHistory
        .filter(b => new Date(b.created_at) >= sevenDaysAgo)
        .map(b => new Date(b.created_at).toDateString())
    );
    const activeDaysLast7 = uniqueDaysLast7.size;

    let engagementStatus = 'inactive';
    if (activeDaysLast7 >= 5 || activeDaysCount >= 15) {
      engagementStatus = 'daily';
    } else if (activeDaysCount >= 4) {
      engagementStatus = 'weekly';
    } else if (activeDaysCount >= 1) {
      engagementStatus = 'monthly';
    }

    const userProfile = {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      wallet_balance: user.wallet_balance,
      is_active: user.is_active,
      created_at: user.created_at,
      role: user.role,
      engagement_status: engagementStatus
    };

    // Fetch transactions of type deposit
    const Transaction = require('../models/Transaction');
    const Payment = require('../models/Payment');
    
    const deposits = await Transaction.find({
      user_id: user._id,
      type: 'deposit'
    }).sort({ created_at: -1 });

    const payments = await Payment.find({
      user_id: user._id
    }).sort({ created_at: -1 });

    // Fetch withdrawals
    const withdrawals = await WithdrawalRequest.find({
      user_id: user._id
    }).sort({ requested_at: -1 });

    // Fetch wagers
    const wagers = await Bet.find({
      user_id: user._id
    }).sort({ created_at: -1 }).limit(100);

    res.json({
      user: userProfile,
      deposits,
      payments,
      withdrawals,
      wagers
    });
  } catch (error) {
    console.error('Error fetching admin user detail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Toggle active status (block/unblock)
    user.is_active = !user.is_active;
    await user.save();
    
    const action = user.is_active ? 'UNBLOCK_USER' : 'BLOCK_USER';
    await logAdminAction(req.user.id, action, user._id, 'User', {}, req);
    
    res.json({ message: user.is_active ? 'User unblocked successfully' : 'User blocked successfully', is_active: user.is_active });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const adjustWalletBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, action, remarks } = req.body;
    
    const parsedAmount = Math.round(Number(amount));

    if (!parsedAmount || parsedAmount <= 0 || !['credit', 'deduct'].includes(action)) {
      return res.status(400).json({ error: 'Invalid adjustment parameters. Amount must be a positive integer.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (action === 'deduct' && user.wallet_balance < parsedAmount) {
      return res.status(400).json({ error: 'Cannot deduct more than the user\'s current balance.' });
    }

    const adjustmentAmount = action === 'credit' ? parsedAmount : -parsedAmount;
    
    // Create admin adjustment transaction
    const { user: updatedUser } = await updateBalance(
      user._id,
      adjustmentAmount,
      'deposit', // Using deposit type for credits to appear in wallet history, or a new type if preferred
      'admin_adjustment_' + Date.now(),
      `Admin adjustment: ${remarks || action}`
    );

    await logAdminAction(req.user.id, 'ADJUST_WALLET', user._id, 'User', { amount: adjustmentAmount, action, remarks }, req);

    const io = getIo();
    if (io) {
      io.to(user._id.toString()).emit('balance_updated', { balance: updatedUser.wallet_balance });
    }

    res.json({ message: `Wallet ${action}ed successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const getReports = async (req, res) => {
  try {
    const { period, customStartDate, customEndDate } = req.query; // 'daily', 'weekly', 'monthly', 'custom'
    let startDate = new Date();
    let endDate = new Date();
    
    if (period === 'custom') {
      startDate = customStartDate ? new Date(customStartDate) : new Date(new Date().setHours(0,0,0,0));
      endDate = customEndDate ? new Date(customEndDate) : new Date();
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      // Default daily
      startDate.setDate(startDate.getDate() - 1);
    }

    const matchQuery = { created_at: { $gte: startDate, $lte: endDate } };

    // 1. Total Bets Volume
    const betStats = await Bet.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, totalVolume: { $sum: '$bet_amount' }, totalWins: { $sum: '$win_amount' }, count: { $sum: 1 } } }
    ]);

    // 2. Deposits
    const depositStats = await require('../models/Transaction').aggregate([
      { $match: { ...matchQuery, type: 'deposit', status: 'success' } },
      { $group: { _id: null, totalDeposits: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // 3. Withdrawals
    const withdrawalStats = await WithdrawalRequest.aggregate([
      { $match: { requested_at: { $gte: startDate, $lte: endDate }, status: 'approved' } },
      { $group: { _id: null, totalWithdrawals: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({
      period,
      startDate,
      endDate,
      bets: {
        volume: betStats[0]?.totalVolume || 0,
        payouts: betStats[0]?.totalWins || 0,
        count: betStats[0]?.count || 0,
        grossGamingRevenue: (betStats[0]?.totalVolume || 0) - (betStats[0]?.totalWins || 0)
      },
      deposits: {
        amount: depositStats[0]?.totalDeposits || 0,
        count: depositStats[0]?.count || 0
      },
      withdrawals: {
        amount: withdrawalStats[0]?.totalWithdrawals || 0,
        count: withdrawalStats[0]?.count || 0
      }
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

module.exports = {
  getDashboardStats,
  getGameStatus,
  getPendingWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getDeposits,
  approveDeposit,
  rejectDeposit,
  overrideResult,
  getBetAggregation,
  getSettings,
  updateSettings,
  getAllBetsBreakdown,
  getAdminUsers,
  getAdminUserDetail,
  toggleUserBlock,
  adjustWalletBalance,
  getReports
};
