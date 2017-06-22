const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const Question = require('../models/question');
const User = require('../models/user');

router.post('/add', function (req, res, next) {

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

module.exports = router;
