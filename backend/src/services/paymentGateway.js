const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const { updateBalance } = require('./walletService');
const logger = require('../utils/logger');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (userId, amount) => {
  const options = {
    amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
    currency: "INR",
    receipt: `receipt_${Date.now()}`
  };

  let order;
  // Fallback for local development if real Razorpay keys are not provided
  if (process.env.RAZORPAY_KEY_ID.includes('xxxx')) {
    logger.info('Using mock Razorpay order for development');
    order = {
      id: `order_mock_${Date.now()}`,
      amount: options.amount,
      currency: options.currency
    };
  } else {
    order = await razorpay.orders.create(options);
  }

  const payment = new Payment({
    gateway_txn_id: order.id,
    user_id: userId,
    amount: amount,
    razorpay_order_id: order.id,
    status: 'created'
  });

  await payment.save();
  return order;
};

const verifyWebhookSignature = (body, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('hex');
  
  return expectedSignature === signature;
};

const processPaymentCapture = async (payload) => {
  const { order_id, id: payment_id, amount } = payload.payment.entity;
  
  // Atomic find and update to prevent replay attacks and double-processing
  const payment = await Payment.findOneAndUpdate(
    { razorpay_order_id: order_id, processed: false },
    { $set: { processed: true, status: 'success', razorpay_payment_id: payment_id } },
    { new: true }
  );

  if (!payment) {
    logger.warn(`Payment record not found or already processed for order ${order_id}`);
    return;
  }

  await updateBalance(
    payment.user_id,
    amount / 100,
    'deposit',
    payment_id,
    'Deposit via Razorpay'
  );

  logger.info(`Deposit successful for user ${payment.user_id}, amount ${amount/100}`);
};

module.exports = {
  createOrder,
  verifyWebhookSignature,
  processPaymentCapture
};
