const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const PORT = process.env.PORT || 5000;

var mongoose = require("mongoose");

var db = mongoose.connect(process.env.MONGODB_URI);
var Movie = require("./movie.js");

var Question = require("./models/question")

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot');
})


// Facebook Webhook
// Used for verification
app.get("/webhook/", function (req, res) {
    if (req.query["hub.verify_token"] === process.env.VERIFICATION_TOKEN) {
        console.log("Verified webhook");
        res.status(200).send(req.query["hub.challenge"]);
    } else {
        console.error("Verification failed. The tokens do not match.");
        res.sendStatus(403);
    }
});

// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {
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


app.get("/test", function (req, res) {

	let test = "";

	res.send(test);
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
            var message = greeting + "My name is SP Movie Bot. I can tell you various details regarding movies. What movie would you like to know about?";
            sendMessage(senderId, {text: message});
        });
    } else if (payload === "Correct") {
        sendMessage(senderId, {text: "Awesome! What would you like to find out? Enter 'plot', 'date', 'runtime', 'director', 'cast' or 'rating' for the various details."});
    } else if (payload === "Incorrect") {
        sendMessage(senderId, {text: "Oops! Sorry about that. Try using the exact title of the movie"});
    }
}

function getMessengerName(senderId, callback) {

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
			}

			return callback(name);

			console.log("message get name fun");
			console.log(name);

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


						console.log("message");
						console.log(name);

						if (formattedMsg === "hi" ) {

							getMessengerName(senderId, function (res) {
								name = res;
							}, sendMessage(senderId, {text: "Hi "+ name + ",How I can Help you?"}));

							console.log("message1");
							console.log(name);

							//sendMessage(senderId, {text: "Hi "+ name + ",How I can Help you?"});
						} else {
							sendMessage(senderId, {text: "we are proceesing the data catch you soon"});
						}
        } else if (message.attachments) {
            sendMessage(senderId, {text: "Sorry, I don't understand your request."});
        }
    }
}


function getQuestionAnswer(userId, question) {

    Question.findOne({question: question}, function(err, question) {
        if(err) {
            sendMessage(userId, {text: "Something went wrong. Try again"});
        } else {
            sendMessage(userId, {text: question[answer]});
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


//const token = process.env.FB_PAGE_ACCESS_TOKEN;

// Spin up the server
app.listen(PORT, function() {
	console.log('running on port', PORT);
})
