const Bet = require('../models/Bet');
const Setting = require('../models/Setting');
const { updateBalance } = require('./walletService');
const mongoose = require('mongoose');

const placeBet = async (userId, cardCode, betAmount) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Placing bet for user:', userId, 'card:', cardCode, 'amount:', betAmount);
    const now = new Date();
    const startOfHour = new Date(now);
    startOfHour.setMinutes(0, 0, 0);
    console.log('Start of hour:', startOfHour);

    // Check betting window
    const bettingCloseMinute = (await Setting.findOne({ key: 'betting_close_minute' }))?.value || 50;
    const closingTime = new Date(startOfHour);
    closingTime.setMinutes(bettingCloseMinute);

    if (now > closingTime) {
      const err = new Error('Betting closed for this hour');
      err.code = 'BETTING_CLOSED';
      throw err;
    }

    console.log('Deducting from wallet...');
    const { transaction } = await updateBalance(
      userId,
      -betAmount,
      'bet_placed',
      null,
      `Bet placed on ${cardCode}`,
      session
    );
    console.log('Wallet deducted, transaction:', transaction._id);

    // Create bet
    const bet = new Bet({
      user_id: userId,
      hour_slot: startOfHour,
      card_code: cardCode,
      bet_amount: betAmount,
      status: 'pending'
    });

    await bet.save({ session });

    // Update transaction reference
    transaction.reference_id = bet._id.toString();
    await transaction.save({ session });

    await session.commitTransaction();
    return bet;
  } catch (error) {
    await session.abortTransaction();
    console.error('placeBet error caught:', error.message);
    
    // Fallback for non-replica set local environments
    if (error.message.includes('session') || error.message.includes('replica set') || error.message.includes('transaction')) {
      console.log('Falling back to non-transactional bet placement...');
      session.endSession();
      return await placeBetWithoutSession(userId, cardCode, betAmount);
    }
    
    throw error;
  } finally {
    if (session.active) session.endSession();
  }
};

const placeBetWithoutSession = async (userId, cardCode, betAmount) => {
  try {
    const now = new Date();
    const startOfHour = new Date(now);
    startOfHour.setMinutes(0, 0, 0);

    // Check betting window
    const bettingCloseMinute = (await Setting.findOne({ key: 'betting_close_minute' }))?.value || 50;
    const closingTime = new Date(startOfHour);
    closingTime.setMinutes(bettingCloseMinute);

    if (now > closingTime) {
      const err = new Error('Betting closed for this hour');
      err.code = 'BETTING_CLOSED';
      throw err;
    }

    // Deduct from wallet
    const { transaction } = await updateBalance(
      userId,
      -betAmount,
      'bet_placed',
      null,
      `Bet placed on ${cardCode}`
    );

    // Create bet
    const bet = new Bet({
      user_id: userId,
      hour_slot: startOfHour,
      card_code: cardCode,
      bet_amount: betAmount,
      status: 'pending'
    });

    await bet.save();

    // Update transaction reference
    transaction.reference_id = bet._id.toString();
    await transaction.save();

    return bet;
  } catch (error) {
    console.error('placeBetWithoutSession error:', error.message);
    throw error;
  }
};

module.exports = { placeBet };
