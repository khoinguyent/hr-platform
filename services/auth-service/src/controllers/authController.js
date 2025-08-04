const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const generateTokens = (user) => {
  // Enhanced JWT payload with more user context
  const accessTokenPayload = {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    isAdmin: user.is_admin || false
  };

  const accessToken = jwt.sign(
    accessTokenPayload,
    process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    process.env.JWT_SECRET || process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const authController = {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName) {
        return res.status(400).json({ message: 'Email, password, and first name are required.' });
      }

      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists.' });
      }

      const newUser = await userModel.createUser(email, password, firstName, lastName);
      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await userModel.findUserByEmail(email);

      if (!user || !user.password_hash) {
        return res.status(401).json({ message: 'Invalid credentials or user signed up with a social provider.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const { accessToken, refreshToken } = generateTokens(user);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        accessToken,
        user: { id: user.id, email: user.email, firstName: user.first_name }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  socialLoginCallback(req, res) {
    const user = req.user;
    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    // Redirect to a frontend page that will handle the token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}`);
  },

  async getProfile(req, res) {
    // The user object is attached to the request by the authMiddleware
    const user = await userModel.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  },

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;
      
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not found' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || process.env.REFRESH_TOKEN_SECRET);
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({ message: 'Invalid token type' });
      }

      const user = await userModel.findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

      // Set new refresh token cookie
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        accessToken,
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.first_name,
          lastName: user.last_name,
          isAdmin: user.is_admin || false
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  },

  async logout(req, res) {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = authController;