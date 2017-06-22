const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

//register
router.post('/register', function (req, res, next) {
  let newUser = new User({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });

  User.addUser(newUser, function (err, user) {
    if (err) {
      res.json({success: false, msg: "Failed to Register User"});
    } else {
      res.json({success: true, msg: "User register"});
    }
  });

});

router.post('/authenticate', function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  User.getUserByUsername(username, function (err, user) {

    if(err) throw err;

    if (!user) {
      res.json({success: false, msg: "User not found"});
    }

    if (user) {
    User.comparePassword(password, user.password, function (err, isMatch) {
      if(err) throw err;

      if (isMatch) {
        const token = jwt.sign(user, "my-secret-token", {
          expiresIn: 604800
        });

        res.json({
          success: true,
          token: 'JWT '+token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      } else {
        res.json({success: false, msg: "wrong password"});
      }
    });
  }
  });
});

router.get('/profile', passport.authenticate('jwt', {session: false}), function (req, res, next) {
  res.json({user: req.user});
});

module.exports = router;
