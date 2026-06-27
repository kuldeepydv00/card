const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { signupSchema, verifySignupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../utils/validators');

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/verify-signup', validate(verifySignupSchema), authController.verifySignupOtp);
router.post('/login', validate(loginSchema), authController.login);
router.post('/verify-login-otp', authController.verifyLoginOtp);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;
