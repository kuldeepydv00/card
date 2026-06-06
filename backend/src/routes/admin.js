const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const adminController = require('../controllers/adminController');

router.use(verifyToken, isAdmin);

router.get('/stats', adminController.getDashboardStats);
router.get('/game-status', adminController.getGameStatus);
router.get('/withdrawals/pending', adminController.getPendingWithdrawals);
router.put('/withdrawals/:id/approve', adminController.approveWithdrawal);
router.put('/withdrawals/:id/reject', adminController.rejectWithdrawal);

router.get('/deposits', adminController.getDeposits);
router.put('/deposits/:id/approve', adminController.approveDeposit);
router.put('/deposits/:id/reject', adminController.rejectDeposit);

router.post('/override-result', adminController.overrideResult);
router.get('/hour/:hourSlot/bet-aggregation', adminController.getBetAggregation);

router.get('/settings', adminController.getSettings);
router.post('/settings', adminController.updateSettings);

router.get('/bets/breakdown', adminController.getAllBetsBreakdown);

router.get('/users', adminController.getAdminUsers);
router.get('/users/:id/details', adminController.getAdminUserDetail);
router.post('/users/:id/block', adminController.toggleUserBlock);
router.post('/users/:id/wallet', adminController.adjustWalletBalance);

router.get('/withdrawals', adminController.getAllWithdrawals);
router.get('/reports', adminController.getReports);

module.exports = router;
