// const express = require('express')
// const passport = require('passport')
// const router = express.Router()

// // @desc    Auth with Google
// // @route   GET /auth/google
// router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

// // @desc    Google auth callback
// // @route   GET /auth/google/callback
// router.get(
//   '/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   (req, res) => {
//     res.redirect('/dashboard')
//   }
// )

// // @desc    Logout user
// // @route   /auth/logout
// router.get('/logout', (req, res) => {
//   req.logout()
//   res.redirect('/')
// })

// module.exports = router

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { ensureGuest } = require('../middleware/auth');

// Login Page
router.get('/login', ensureGuest, (req, res) => res.render('users/login', {
  layout: 'login',
}));

// Register Page
router.get('/register', ensureGuest, (req, res) => res.render('users/register', {
  layout: 'login',
}));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('users/register', {
      layout:'login',
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('users/register', {
          layout:'login',
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                // req.flash(
                //   'success_msg',
                //   'You are now registered and can log in'
                // );
                res.redirect('/auth/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

module.exports = router;
