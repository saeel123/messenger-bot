const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');

const Question = require('../models/question');
const User = require('../models/user');

router.post('/add',  passport.authenticate('jwt', {session: false}), function (req, res, next) {

  let newQuestion = new Question({
    question: req.body.question,
    answer: req.body.answer
  });

  Question.addQuestion(newQuestion, function (err, question) {
    if (err) {
      res.json({success: false, msg: "Unable to add Question"});
    } else {
      res.json({success: true, msg: "Question Added Successfully"});
    }
  });

});

router.get('/',  passport.authenticate('jwt', {session: false}), function (req, res, next) {

  Question.findAllQuestion(function (err, questions) {
    if (err) {
      res.json({success: false, msg: "Unable to get Question"});
    } else {
      res.json({success: true, msg: "Questions fetched Successfully", data: questions});
    }
  });

});

router.get('/:id',  passport.authenticate('jwt', {session: false}), function (req, res, next) {

  var id = parseInt(req.params.id, 10);

  var where = {
    'id': id
  };

  Question.findById(where,function (err, question) {
    if (err) {
      res.json({success: false, msg: "Unable to get Question"});
    } else {
      res.json({success: true, msg: "Questions fetched Successfully", data: question});
    }
  });

});

module.exports = router;
