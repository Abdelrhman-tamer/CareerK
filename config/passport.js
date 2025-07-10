const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { pool } = require('../config/db');
require('dotenv').config();

// 🔹 Helper function to find user in all tables
const findUserByEmail = async (email) => {
  let user = null;
  let role = '';

  // Check Developers
  let result = await pool.query('SELECT id, email FROM developers WHERE email = $1', [email]);
  if (result.rows.length > 0) {
    user = result.rows[0];
    role = 'developer';
  }

  // Check Companies
  if (!user) {
    result = await pool.query('SELECT id, email FROM companies WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      user = result.rows[0];
      role = 'company';
    }
  }

  // Check Customers
  if (!user) {
    result = await pool.query('SELECT id, email FROM customers WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      user = result.rows[0];
      role = 'customer';
    }
  }

  return user ? { id: user.id, email: user.email, role } : null;
};

// 🔹 JWT Strategy for token-based authentication
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const user = await findUserByEmail(jwtPayload.email);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// 🔹 Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await findUserByEmail(email);

        if (!user) {
          return done(null, false, { message: 'No account found. Please sign up first.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// 🔹 GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      // scope: ['user:email'],
      scope: ['user:email', 'read:user'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let email = profile.emails?.[0]?.value; // Get email if available
    
        if (!email) {
          // If no email, fetch from GitHub API
          const response = await fetch('https://api.github.com/user/emails', {
            headers: { Authorization: `token ${accessToken}` },
          });
          const emails = await response.json();
          const primaryEmail = emails.find(e => e.primary)?.email;
          email = primaryEmail || null;
        }
    
        if (!email) return done(null, false, { message: 'No email found in GitHub account.' });
    
        let user = await findUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'No account found. Please sign up first.' });
        }
    
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// 🔹 Serialize & Deserialize User
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;









// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const GitHubStrategy = require("passport-github2").Strategy;
// // const User = require("../models/User");
// const jwt = require("jsonwebtoken");

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL,
//       passReqToCallback: true, // Allows us to access req.body
//     },
//     async (req, accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ email: profile.emails[0].value });

//         if (!user) {
//           user = await User.create({
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             googleId: profile.id,
//             role: req.session.role || "developer", // Get role from session
//           });
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: process.env.GITHUB_CALLBACK_URL,
//       passReqToCallback: true,
//     },
//     async (req, accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ email: profile.emails[0].value });

//         if (!user) {
//           user = await User.create({
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             githubId: profile.id,
//             role: req.session.role || "developer", // Get role from session
//           });
//         }

//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );
