var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var QuestionSchema = mongoose.Schema({
  question: {type: String},
  answer: {type: String}
});

const Question = module.exports = mongoose.model("Question", QuestionSchema);

module.exports.findByQuestion = function (question, callback) {
  const query = {question: question};
  Question.findOne(query, callback);

}

module.exports.addQuestion = function (newQuestion, callback) {
      newQuestion.save(callback);
}
