const express = require('express');
const router = express.Router();
const { verifyWebhookSignature, processPaymentCapture } = require('../services/paymentGateway');
const logger = require('../utils/logger');

router.post('/razorpay', express.json(), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  
  if (!verifyWebhookSignature(req.body, signature)) {
    logger.warn('Invalid Razorpay webhook signature');
    return res.status(400).send('Invalid signature');
  }

  const event = req.body.event;
  logger.info(`Received Razorpay webhook: ${event}`);

  if (event === 'payment.captured') {
    try {
      await processPaymentCapture(req.body.payload);
    } catch (error) {
      logger.error('Error processing payment capture:', error);
      return res.status(500).send('Processing error');
    }
  }

  res.send('OK');
});

module.exports = router;
