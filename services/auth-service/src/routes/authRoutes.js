const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Local Auth
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Protected route example
router.get('/profile', protect, authController.getProfile);

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login/failed' }), authController.socialLoginCallback);

// Facebook Auth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login/failed' }), authController.socialLoginCallback);

router.get('/login/failed', (req, res) => {
    res.status(401).json({ message: 'Social login failed.' });
});

module.exports = router;
