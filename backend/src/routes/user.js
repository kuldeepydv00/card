const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const betController = require('../controllers/betController');
const walletController = require('../controllers/walletController');
const resultController = require('../controllers/resultController');
const { validate } = require('../middleware/validation');
const { placeBetSchema, depositSchema, manualDepositSchema, withdrawalSchema } = require('../utils/validators');
const { betLimiter } = require('../middleware/rateLimiter');

// Profile & Wallet
router.get('/balance', verifyToken, walletController.getBalance);
router.get('/transactions', verifyToken, walletController.getTransactions);

// Betting
router.post('/bet/place', verifyToken, betLimiter, validate(placeBetSchema), betController.placeBet);
router.get('/bets/current', verifyToken, betController.getUserCurrentBets);
router.get('/bets/history', verifyToken, betController.getUserBetsHistory);

// Payments & Withdrawals
router.post('/deposit/create-order', verifyToken, validate(depositSchema), walletController.createDepositOrder);
router.post('/deposit/manual-request', verifyToken, validate(manualDepositSchema), walletController.submitManualDeposit);
router.get('/deposit/history', verifyToken, walletController.getManualDeposits);
router.post('/withdraw/request', verifyToken, validate(withdrawalSchema), walletController.requestWithdrawal);

// Results
router.get('/results/latest', resultController.getLatestResults);

// Config
router.get('/config/payment', walletController.getPublicSettings);

module.exports = router;
