const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const userModel = require('../models/userModel');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback", // The full URL is handled by the proxy
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await userModel.findOrCreateUserByProvider(profile);
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'name']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await userModel.findOrCreateUserByProvider(profile);
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
  }
));