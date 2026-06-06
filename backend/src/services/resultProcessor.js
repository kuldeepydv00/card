const Bet = require('../models/Bet');
const HourlyResult = require('../models/HourlyResult');
const Setting = require('../models/Setting');
const User = require('../models/User');
const { updateBalance } = require('./walletService');
const { resolveTie } = require('../utils/tieBreaker');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const { getIo } = require('../config/socket');

// Define all 52 standard cards
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['H', 'D', 'C', 'S'];
const ALL_CARDS = RANKS.flatMap(rank => SUITS.map(suit => `${rank}${suit}`));

const processHourlyResult = async (hourSlot, manualWinningCard = null, adminId = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if already processed
    const existingResult = await HourlyResult.findOne({ hour_slot: hourSlot }).session(session);
    if (existingResult && existingResult.is_processed) {
      logger.info(`Result for ${hourSlot} already processed.`);
      return existingResult;
    }

    // Fetch all bets for the slot
    const bets = await Bet.find({ hour_slot: hourSlot, status: 'pending' }).session(session);
    
    let winningCard = manualWinningCard;
    let snapshot = { card: null, total_amount: 0, tied_cards: [] };
    let tieBreakerUsed = null;

    if (!winningCard) {
      if (bets.length === 0) {
        winningCard = null; // No bets, no winner
      } else {
        // Calculate total bet per card
        const aggregation = await Bet.aggregate([
          { $match: { hour_slot: hourSlot } },
          { $group: { _id: "$card_code", total: { $sum: "$bet_amount" } } }
        ]).session(session);

        const cardTotals = {};
        ALL_CARDS.forEach(card => cardTotals[card] = 0);
        aggregation.forEach(a => {
          if (cardTotals[a._id] !== undefined) {
            cardTotals[a._id] = a.total;
          }
        });

        let lowestAmount = Infinity;
        let tiedCards = [];
        
        for (const [card, total] of Object.entries(cardTotals)) {
          if (total < lowestAmount) {
            lowestAmount = total;
            tiedCards = [card];
          } else if (total === lowestAmount) {
            tiedCards.push(card);
          }
        }
        
        
        const rule = (await Setting.findOne({ key: 'tie_breaker_rule' }))?.value || 'random';
        winningCard = resolveTie(tiedCards, rule);
        
        snapshot = {
          card: winningCard,
          total_amount: lowestAmount,
          tied_cards: tiedCards
        };
        tieBreakerUsed = tiedCards.length > 1 ? rule : null;
      }
    }

    const totalBetVolume = bets.reduce((sum, b) => sum + b.bet_amount, 0);

    // Update bets and payouts
    const io = getIo();
    for (const bet of bets) {
      if (bet.card_code === winningCard) {
        const winAmount = bet.bet_amount * 50;
        bet.win_amount = winAmount;
        bet.status = 'settled';
        
        const { user: updatedUser } = await updateBalance(
          bet.user_id,
          winAmount,
          'winning',
          bet._id.toString(),
          `Winnings for card ${winningCard}`,
          session
        );

        // Emit real-time balance update to the winning user
        if (io) {
          io.to(bet.user_id.toString()).emit('balance_updated', {
            balance: updatedUser.wallet_balance,
            won: true,
            winAmount,
            card: winningCard
          });
        }
      } else {
        bet.win_amount = 0;
        bet.status = 'settled';
      }
      await bet.save({ session });
    }

    // Create or update HourlyResult
    const resultData = {
      hour_slot: hourSlot,
      winning_card: winningCard,
      is_processed: true,
      processed_at: new Date(),
      declared_by: manualWinningCard ? 'admin_override' : 'auto',
      admin_override_user_id: adminId,
      total_bet_volume: totalBetVolume,
      lowest_bet_card_snapshot: snapshot,
      tie_breaker_used: tieBreakerUsed
    };

    const result = await HourlyResult.findOneAndUpdate(
      { hour_slot: hourSlot },
      resultData,
      { upsert: true, new: true, session }
    );

    await session.commitTransaction();
    logger.info(`Result processed for ${hourSlot}: Winning Card ${winningCard}`);
    return result;
  } catch (error) {
    await session.abortTransaction();
    
    // Fallback for non-replica set local environments
    if (error.message.includes('session') || error.message.includes('replica set') || error.message.includes('transaction')) {
      session.endSession();
      return await processHourlyResultWithoutSession(hourSlot, manualWinningCard, adminId);
    }
    
    logger.error('Error processing hourly result:', error);
    throw error;
  } finally {
    if (session.active) session.endSession();
  }
};

const processHourlyResultWithoutSession = async (hourSlot, manualWinningCard = null, adminId = null) => {
  // Check if already processed
  const existingResult = await HourlyResult.findOne({ hour_slot: hourSlot });
  if (existingResult && existingResult.is_processed) {
    logger.info(`Result for ${hourSlot} already processed.`);
    return existingResult;
  }

  // Fetch all bets for the slot
  const bets = await Bet.find({ hour_slot: hourSlot, status: 'pending' });
  
  let winningCard = manualWinningCard;
  let snapshot = { card: null, total_amount: 0, tied_cards: [] };
  let tieBreakerUsed = null;

  if (!winningCard) {
    if (bets.length === 0) {
      winningCard = null;
    } else {
      const aggregation = await Bet.aggregate([
        { $match: { hour_slot: hourSlot } },
        { $group: { _id: "$card_code", total: { $sum: "$bet_amount" } } }
      ]);

      const cardTotals = {};
      ALL_CARDS.forEach(card => cardTotals[card] = 0);
      aggregation.forEach(a => {
        if (cardTotals[a._id] !== undefined) {
          cardTotals[a._id] = a.total;
        }
      });

      let lowestAmount = Infinity;
      let tiedCards = [];
      
      for (const [card, total] of Object.entries(cardTotals)) {
        if (total < lowestAmount) {
          lowestAmount = total;
          tiedCards = [card];
        } else if (total === lowestAmount) {
          tiedCards.push(card);
        }
      }
      
      const rule = (await Setting.findOne({ key: 'tie_breaker_rule' }))?.value || 'random';
      winningCard = resolveTie(tiedCards, rule);
      
      snapshot = {
        card: winningCard,
        total_amount: lowestAmount,
        tied_cards: tiedCards
      };
      tieBreakerUsed = tiedCards.length > 1 ? rule : null;
    }
  }

  const totalBetVolume = bets.reduce((sum, b) => sum + b.bet_amount, 0);

  // Update bets and payouts
  const io = getIo();
  for (const bet of bets) {
    if (bet.card_code === winningCard) {
      const winAmount = bet.bet_amount * 50;
      bet.win_amount = winAmount;
      bet.status = 'settled';
      
      const { user: updatedUser } = await updateBalance(
        bet.user_id,
        winAmount,
        'winning',
        bet._id.toString(),
        `Winnings for card ${winningCard}`
      );

      // Emit real-time balance update to the winning user
      if (io) {
        io.to(bet.user_id.toString()).emit('balance_updated', {
          balance: updatedUser.wallet_balance,
          won: true,
          winAmount,
          card: winningCard
        });
      }
    } else {
      bet.win_amount = 0;
      bet.status = 'settled';
    }
    await bet.save();
  }

  const resultData = {
    hour_slot: hourSlot,
    winning_card: winningCard,
    is_processed: true,
    processed_at: new Date(),
    declared_by: manualWinningCard ? 'admin_override' : 'auto',
    admin_override_user_id: adminId,
    total_bet_volume: totalBetVolume,
    lowest_bet_card_snapshot: snapshot,
    tie_breaker_used: tieBreakerUsed
  };

  const result = await HourlyResult.findOneAndUpdate(
    { hour_slot: hourSlot },
    resultData,
    { upsert: true, new: true }
  );

  logger.info(`Result processed (NO SESSION) for ${hourSlot}: Winning Card ${winningCard}`);
  return result;
};

module.exports = { processHourlyResult };
