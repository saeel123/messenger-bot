var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var autoIncrement = require('mongoose-auto-increment');


var connection = mongoose.createConnection("mongodb://localhost:27017/messenger-bot");
autoIncrement.initialize(connection);

var QuestionSchema = mongoose.Schema({
  id: {type: String},
  question: {type: String},
  answer: {type: String}
});

QuestionSchema.plugin(autoIncrement.plugin, {
    model: 'Question',
    field: 'id',
    startAt: 0,
    incrementBy: 1
});

const Question = module.exports = mongoose.model("Question", QuestionSchema);

module.exports.findByQuestion = function (question, callback) {
  const query = {question: question};
  Question.findOne(query, callback);
}

module.exports.addQuestion = function (newQuestion, callback) {
      newQuestion.save(callback);
}

module.exports.findAllQuestion = function (callback) {
  Question.find(callback);
}

module.exports.findById = function (id, callback) {
  Question.find(id, callback);
}
