const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
var mongoose = require("mongoose");


const PORT = process.env.PORT || 5000;
const db = mongoose.connect(process.env.MONGODB_URI);
//const db = mongoose.connect("mongodb://localhost:27017/messenger-bot");


const webhooks = require('./routes/webhooks');



// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// Process application/json
app.use(bodyParser.json());

//middleware
app.use('/webhook/', webhooks);

// Index route
app.get('/', function (req, res) {
	res.send('Hello world, I am a chat bot');
})



// Spin up the server
app.listen(PORT, function() {
	console.log('running on port', PORT);
})
