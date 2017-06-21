var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
  question: {type: String},
  answer: {type: String}
});

const Question = module.exports = mongoose.model("Question", QuestionSchema);

module.exports.findByQuestion = function (question, callback) {
  const query = {question: question};
  Question.findOne(query, callback);
}

module.exports.findByQuestion = function (question, callback) {
  const query = {question: question};
  Question.findOne(query, callback);
}

module.exports.addQuestion = function (newQuestion, callback) {
      console.log("model");
      console.log(newQuestion);
      console.log("model");
      //newQuestion.save(callback);
}
