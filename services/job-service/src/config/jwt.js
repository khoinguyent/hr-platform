const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

const jwtConfig = {
  secret: JWT_SECRET,
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  
  // Verify token and return decoded payload
  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw error;
    }
  },

  // Extract user info from token
  extractUserFromToken: (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return {
        id: decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        isAdmin: decoded.isAdmin || false
      };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = jwtConfig; 