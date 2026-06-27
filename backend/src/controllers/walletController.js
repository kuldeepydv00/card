const Transaction = require('../models/Transaction');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const DepositRequest = require('../models/DepositRequest');
const { createOrder } = require('../services/paymentGateway');
const { createNotification } = require('../services/notificationService');

const getBalance = async (req, res) => {
  res.json({ balance: req.user.wallet_balance });
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .limit(50);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createDepositOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await createOrder(req.user.id, amount);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create deposit order' });
  }
};

const submitManualDeposit = async (req, res) => {
  try {
    const { amount, utrNumber } = req.body;
    
    // Check if UTR is already used
    const existing = await DepositRequest.findOne({ utr_number: utrNumber });
    if (existing) {
      return res.status(400).json({ error: 'This UTR/Transaction ID has already been submitted' });
    }

    const request = new DepositRequest({
      user_id: req.user.id,
      amount,
      utr_number: utrNumber
    });

    await request.save();
    
    // Trigger notification
    await createNotification(
      req.user.id,
      'Deposit Pending',
      `Your deposit request of ₹${amount} is pending admin approval.`,
      'deposit'
    );
    
    res.status(201).json({ message: 'Deposit request submitted successfully', request });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getManualDeposits = async (req, res) => {
  try {
    const deposits = await DepositRequest.find({ user_id: req.user.id })
      .sort({ requested_at: -1 })
      .limit(50);
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const requestWithdrawal = async (req, res) => {
  try {
    const { amount, account_details } = req.body;
    const { updateBalance } = require('../services/walletService');

    // Check for existing pending request to fail fast
    const existing = await WithdrawalRequest.findOne({ 
      user_id: req.user.id, 
      status: 'pending' 
    });
    if (existing) {
      return res.status(400).json({ error: 'You already have a pending withdrawal request' });
    }

    // Atomic deduction first
    let transaction;
    try {
      const result = await updateBalance(
        req.user.id,
        -amount,
        'withdrawal', // type 'withdrawal' for the deduction
        null, // will update reference_id below
        'Withdrawal request placed (pending approval)'
      );
      transaction = result.transaction;
    } catch (err) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const request = new WithdrawalRequest({
      user_id: req.user.id,
      amount,
      account_details
    });

    await request.save();

    // Update transaction reference_id to the request _id
    transaction.reference_id = request._id.toString();
    await transaction.save();

    // Trigger notification
    await createNotification(
      req.user.id,
      'Withdrawal Pending',
      `Your withdrawal request of ₹${amount} is pending admin approval.`,
      'withdrawal'
    );

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPublicSettings = async (req, res) => {
  try {
    const settings = await require('../models/Setting').find({ 
      key: { $in: ['payment_upi_id', 'payment_bank_details'] } 
    });
    const formatted = {};
    settings.forEach(s => formatted[s.key] = s.value);
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment info' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      { is_read: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { 
  getBalance, 
  getTransactions, 
  createDepositOrder, 
  submitManualDeposit,
  getManualDeposits,
  requestWithdrawal,
  getPublicSettings,
  getNotifications,
  markNotificationAsRead
};
