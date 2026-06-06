const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

/**
 * Atomic wallet update with transaction logging
 */
const updateBalance = async (userId, amount, type, referenceId, description = '', session = null) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, wallet_balance: { $gte: amount < 0 ? Math.abs(amount) : 0 } },
    { $inc: { wallet_balance: amount } },
    { new: true, session }
  );

  if (!user) {
    throw new Error('Insufficient balance or user not found');
  }

  const transaction = new Transaction({
    user_id: userId,
    type,
    amount,
    wallet_balance_after: user.wallet_balance,
    reference_id: referenceId,
    description
  });

  await transaction.save({ session });

  return { user, transaction };
};

module.exports = { updateBalance };
