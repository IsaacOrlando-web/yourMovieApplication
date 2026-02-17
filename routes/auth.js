var express = require('express');
var passport = require('passport');
var router = express.Router();
var GoogleStrategy = require('passport-google-oidc');
var { getDatabase } = require('../db/database');

const isProduction = process.env.NODE_ENV === 'production';

// Middleware para asegurar que la sesión funciona
router.use((req, res, next) => {
    console.log('📝 Auth route accessed:', req.path);
    console.log('  Session exists:', !!req.session);
    console.log('  Session ID:', req.sessionID);
    console.log('  User:', req.user ? 'YES' : 'NO');
    
    if (!req.session) {
        console.error('❌ No session found!');
    }
    next();
});

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Ruta de callback CORREGIDA
router.get('/oauth2/redirect/google', 
    // Middleware 1: Logging
    (req, res, next) => {
        console.log('🔄 Callback recibido de Google');
        console.log('  Session ID:', req.sessionID);
        console.log('  Session content:', req.session);
        console.log('  Cookies:', req.headers.cookie);
        console.log('  Query params:', req.query);
        console.log('  State recibido:', req.query.state);
        next();
    },
    // Middleware 2: Autenticación
    (req, res, next) => {
        passport.authenticate('google', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureMessage: true
        })(req, res, next);
    }
);

router.get('/login/federated/google', (req, res, next) => {
  console.log('Starting Google OAuth login...');
  console.log('Client ID:', process.env['GOOGLE_CLIENT_ID'] ? 'SET' : 'NOT SET');
  console.log('Client Secret:', process.env['GOOGLE_CLIENT_SECRET'] ? 'SET' : 'NOT SET');
  console.log('Session before auth:', {
    id: req.sessionID,
    exists: !!req.session
  });
  
  // Guardar algo en sesión antes de auth
  req.session.loginStart = Date.now();
  req.session.save((err) => {
    if (err) console.error('Error saving session:', err);
    
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  });
});

// Login page with error handling
router.get('/login', (req, res) => {
  const error = req.query.error;
  const errorDescription = req.query.error_description;
  if (error) {
    console.error('Login error:', error, errorDescription);
    res.send(`
      <h1>Login Error</h1>
      <p>Error: ${error}</p>
      <p>Description: ${errorDescription || 'No description provided'}</p>
      <p><a href="/login/federated/google">Try again</a></p>
    `);
  } else {
    res.send(`<h1>Login</h1><p><a href="/login/federated/google">Login with Google</a></p>`);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: isProduction 
    ? 'https://yourmovieapplication.onrender.com/oauth2/redirect/google'
    : '/oauth2/redirect/google',
  scope: ['profile', 'email']
}, async function verify(issuer, profile, cb) {
  console.log('Google OAuth Verify - Issuer:', issuer);
  console.log('Google OAuth Verify - Profile ID:', profile.id);
  console.log('Google OAuth Verify - Display Name:', profile.displayName);
  
  try {
    const db = getDatabase();
    const usersCollection = db.collection('users');
    const federatedCredentialsCollection = db.collection('federated_credentials');
    
    // Buscar credenciales federadas existentes
    const existingCredential = await federatedCredentialsCollection.findOne({
      provider: issuer,
      subject: profile.id
    });

    if (!existingCredential) {
      // Crear nuevo usuario
      const newUser = {
        name: profile.displayName,
        email: profile.emails?.[0]?.value || null,
        profilePicture: profile.photos?.[0]?.value || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await usersCollection.insertOne(newUser);
      const userId = result.insertedId;
      
      // Crear credenciales federadas
      await federatedCredentialsCollection.insertOne({
        user_id: userId,
        provider: issuer,
        subject: profile.id,
        createdAt: new Date()
      });
      
      const createdUser = {
        id: userId,
        name: newUser.name,
        email: newUser.email,
        profilePicture: newUser.profilePicture
      };
      
      return cb(null, createdUser);
    } else {
      const user = await usersCollection.findOne({
        _id: existingCredential.user_id
      });
      
      if (!user) {
        return cb(null, false);
      }
      
      const existingUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
      };
      
      return cb(null, existingUser);
    }
  } catch (error) {
    console.error('Verify error:', error);
    return cb(error);
  }
}));

passport.serializeUser(function(user, cb) {
  console.log('Serializing user:', user.id);
  process.nextTick(function() {
    cb(null, { id: user.id, name: user.name, email: user.email });
  });
});

passport.deserializeUser(function(user, cb) {
  console.log('Deserializing user:', user.id);
  process.nextTick(function() {
    return cb(null, user);
  });
});

module.exports = router;