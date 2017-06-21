var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var QuestionSchema = mongoose.Schema({
  question: {type: String},
  answer: {type: String}
});

const Question = module.exports = mongoose.model("Question", QuestionSchema);

module.exports.findByQuestion = function (question, callback) {

  console.log(question);
  console.log("model question");


  const query = {question: question};
  console.log(query);

  Question.findOne(query, callback);

}

module.exports.addQuestion = function (newQuestion, callback) {
      newQuestion.save(callback);
}
