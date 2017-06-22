const express = require('express');
const router = express.Router();

var Question = require("../models/question");


// Facebook Webhook
// Used for verification
router.get("/", function (req, res) {
    console.log(req.query);


    if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
        console.log("Verified webhook");
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        console.error("Verification failed. The tokens do not match.");
        res.sendStatus(403);
    }
});

// Facebook Webhook
// Used for verification
router.delete("/", function (req, res) {
  res.send("sds");
  console.log("test");
});

// All callbacks for Messenger will be POST-ed here
router.post("/", function (req, res) {
    // Make sure this is a page subscription
    if (req.body.object == "page") {
        // Iterate over each entry
        // There may be multiple entries if batched
        req.body.entry.forEach(function(entry) {
            // Iterate over each messaging event
            entry.messaging.forEach(function(event) {
                if (event.postback) {
                    processPostback(event);
                } else if (event.message) {
                    processMessage(event);
                }
            });
        });

        res.sendStatus(200);
    }
});

function processPostback(event) {
    var senderId = event.sender.id;
    var payload = event.postback.payload;

    if (payload === "Greeting") {
        // Get user's first name from the User Profile API
        // and include it in the greeting
        request({
            url: "https://graph.facebook.com/v2.6/" + senderId,
            qs: {
                access_token: process.env.PAGE_ACCESS_TOKEN,
                fields: "first_name"
            },
            method: "GET"
        }, function(error, response, body) {
            var greeting = "";
            if (error) {
                console.log("Error getting user's name: " +  error);
            } else {
                var bodyObj = JSON.parse(body);
                name = bodyObj.first_name;
                greeting = "Hi " + name + ". ";
            }
            var message = greeting + "We are people who shape your story.";
            sendMessage(senderId, {text: message});
        });
    } else if (payload === "Correct") {
        sendMessage(senderId, {text: "Awesome! How we can help You"});
    } else if (payload === "Incorrect") {
        sendMessage(senderId, {text: "Oops! Sorry about that."});
    }
}

function getMessengerName(senderId, callback) {

	request({
			url: "https://graph.facebook.com/v2.6/" + senderId,
			qs: {
					access_token: process.env.PAGE_ACCESS_TOKEN,
					fields: "first_name"
			},
			method: "GET"
	}, function(error, response, body) {
			var greeting = "";
			if (error) {
					console.log("Error getting user's name: " +  error);
			} else {
					var bodyObj = JSON.parse(body);
					name = bodyObj.first_name;
			}

			return callback(name);
	});
}

function processMessage(event) {
    if (!event.message.is_echo) {
        var message = event.message;
        var senderId = event.sender.id;

        console.log("Received message from senderId: " + senderId);
        console.log("Message is: " + JSON.stringify(message));

        if (message.text) {
						var formattedMsg = message.text.toLowerCase().trim();

						if (formattedMsg === "hi" ) {

							getMessengerName(senderId, function (res) {
								sendMessage(senderId, {text: "Hi "+ res + ",How I can Help you?"});
							});

						} else {
							Question.findByQuestion(formattedMsg, function (err, question) {

								if (err) {
									sendMessage(senderId, {text: "error occured while search"});
								} else if (question === null){

									let newQuestion = new Question({
										question: formattedMsg
									});

									Question.addQuestion(newQuestion, function (newQuestion, err) {
										if (!err) {
											sendMessage(senderId, {text: "we will get back to you soon"});
										} else {
											sendMessage(senderId, {text: "We dint get what you want to say..."});
										}
									});
								} else {
									//sendMessage(senderId, {text: question['question']});
									if (!question['answer']) {
										sendMessage(senderId, {text: "We will get back to you..Thank you For you intrest"});
									} else {
										sendMessage(senderId, {text: question['answer']});
									}
								}
							});
						}
        } else if (message.attachments) {
            sendMessage(senderId, {text: "Sorry, I don't understand your request."});
        }
    }
}


function getQuestionAnswer(userId, question) {

    Question.findByQuestion(question, function(err, question) {
        if(err) {
            sendMessage(userId, {text: "Something went wrong. Try again"});
        } else {
            sendMessage(userId, {text: question});
        }
    });

}

// sends message to user
function sendMessage(recipientId, message) {
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: "POST",
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log("Error sending message: " + response.error);
        }
    });
}

module.exports = router;
