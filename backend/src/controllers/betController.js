const betService = require('../services/betService');
const Bet = require('../models/Bet');
const { getIo } = require('../config/socket');
const logger = require('../utils/logger');

const placeBet = async (req, res) => {
  try {
    const { cardCode, betAmount } = req.body;
    const bet = await betService.placeBet(req.user.id, cardCode, betAmount);
    
    // Emit balance update
    const io = getIo();
    if (io) {
      io.to(req.user.id.toString()).emit('balance_updated', {
        balance: req.user.wallet_balance - betAmount
      });
    }

    res.status(201).json(bet);
  } catch (error) {
    logger.error('Bet placement error:', error);
    
    if (error.code === 'BETTING_CLOSED') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Insufficient balance or user not found') {
      return res.status(400).json({ error: error.message });
    }
    
    // Check for MongoDB transaction error (replica set required)
    if (error.message.includes('sessions are not supported by the MongoDB cluster')) {
       return res.status(500).json({ 
         error: 'Database configuration error', 
         details: 'Transactions require MongoDB Replica Set. Please use Atlas or convert local Mongo to Replica Set.' 
       });
    }

    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const { getCurrentSlot } = require('../utils/timeUtils');

const getUserCurrentBets = async (req, res) => {
  try {
    const startOfHour = getCurrentSlot(new Date());

    const bets = await Bet.find({
      user_id: req.user.id,
      hour_slot: startOfHour
    }).sort({ created_at: -1 });

    res.json(bets);
  } catch (error) {
    logger.error('Fetch current bets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserBetsHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, hourSlot, cardCode, onlyWon } = req.query;
    const query = { user_id: req.user.id };

    if (hourSlot) query.hour_slot = new Date(hourSlot);
    if (cardCode) query.card_code = cardCode;
    if (onlyWon === 'true') query.win_amount = { $gt: 0 };

    const bets = await Bet.find(query)
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Bet.countDocuments(query);

    res.json({
      bets,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error('Fetch history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { placeBet, getUserCurrentBets, getUserBetsHistory };
