'use strict';

const config = require('./config');
const bodyParser = require('body-parser');
const express = require('express');
const Wit = require('node-wit').Wit;
const FB = require('./facebook.action');
const async = require('async');

// Webserver parameter
const PORT = process.env.PORT || 3000;

// Messenger API parameters
if (!config.FB_PAGE_ID) {
    throw new Error('missing FB_PAGE_ID');
}
if (!config.FB_PAGE_TOKEN) {
    throw new Error('missing FB_PAGE_TOKEN');
}

// See the Webhook reference
// https://developers.facebook.com/docs/messenger-platform/webhook-reference
const getFirstMessagingEntry = (body) => {
    const val = body.object == 'page' &&
            body.entry &&
            Array.isArray(body.entry) &&
            body.entry.length > 0 &&
            body.entry[0] &&
            body.entry[0].id === config.FB_PAGE_ID &&
            body.entry[0].messaging &&
            Array.isArray(body.entry[0].messaging) &&
            body.entry[0].messaging.length > 0 &&
            body.entry[0].messaging[0];
    return val || null;
};

//cb = callback

let sessions = {};
const findOrCreateSession = (sessions, fbid, cb) => {

    if (!sessions[fbid]) {
        console.log("New Session for:", fbid);
        sessions[fbid] = {context: {}};
    }
    console.log("Sessions: " + JSON.stringify(sessions) + "FBid" + fbid);
    cb(sessions, fbid);
};

// Wit.ai bot specific code

// Import our bot actions and setting everything up
const actions = require('./wit.actions');
const wit = new Wit(config.WIT_TOKEN, actions);

// Starting our webserver and putting it all together
const app = express();
app.set('port', PORT);
app.listen(app.get('port'));
app.use(bodyParser.json());

// Webhook setup
app.get('/', (req, res) => {
    if (!config.FB_VERIFY_TOKEN) {
        throw new Error('missing FB_VERIFY_TOKEN');
    }
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === config.FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
    } else {
        res.sendStatus(400);
    }
});

let intent = "";
let entityCuisine = "";

// Message handler
app.post('/', (req, res) => {
    // Parsing the Messenger API response
    const messaging = getFirstMessagingEntry(req.body);
    console.log("wit:" + JSON.stringify(wit));
    console.log("object: " + req.body.object);
    console.log("entry: " + JSON.stringify(req.body.entry));
    console.log("body: " + JSON.stringify(req.body));
    if (messaging && messaging.recipient.id === config.FB_PAGE_ID) {
        const recipientId = messaging.recipient.id;
        // Yay! We got a new message!

        // We retrieve the Facebook user ID of the sender
        const sender = messaging.sender.id;
        console.log(sender);

        //For calling wit actions, we need the properties of the msg object
        Object.prototype.hasOwnProperty = function(property) {
            return this[property] !== undefined;
        };


        // We retrieve the user's current session, or create one if it doesn't exist
        // This is needed for our bot to figure out the conversation history
        findOrCreateSession(sessions, sender, (sessions, sessionId) => {
            // We retrieve the message content
            // First do Postbacks -> then go with this context to wit.ai
            async.series(
                [
                    function (callback) {
                        if (messaging.postback) {
                            //POSTBACK
                            const postback = messaging.postback;

                            if (postback.payload === "search" || postback.payload === "GET_STARTED_PAYLOAD") {
                                FB.sendText(
                                    sender,
                                    "What kind of recipe do you search for? What cuisine? For example: african, chinese, japanese, korean, vietnamese, thai, indian, british, irish, french, italian, mexican, spanish, middle eastern, jewish, american, cajun, southern, greek, german, nordic, eastern european, caribbean, or latin american.\""
                                );
                            } else {
                                var context = sessions[sessionId].context;
                                FB.handlePostback(sessionId, context, postback.payload, (context) => {
                                    callback(null, context);
                                    console.log("Context:" + context);
                                });
                            }

                            } else {
                            callback(null, {});
                        }
                    },
                    function (callback) {
                        if (messaging.message) {
                            //MESSAGE

                            const msg = messaging;
                            const atts = messaging.message.attachments;
                            console.log("Msg:" + msg);
                            if (atts) {
                                // We received an attachment

                                // Let's reply with an automatic message
                                FB.sendText(
                                    sender,
                                    msg
                                );
                                callback(null, {});

                            } else {
                                var context = sessions[sessionId].context;
                                console.log("Run wit with context", sessions[sessionId].context);
                                console.log("Ola: " + JSON.stringify(context));
                                console.log("Recipient ID: " + recipientId);
                                console.log("Sender ID: " + sender);
                                // Let's forward the message to the Wit.ai Bot Engine
                                // This will run all actions until our bot has nothing left to do
                                wit.runActions(
                                    sessionId, // the user's current session
                                    msg, // the user's message
                                    sessions[sessionId].context, // the user's current session state
                                    (error, context) => {
                                        if (error) {
                                            console.log('Oops! Got an error from Wit:', error);
                                            // if (error === "No 'null' action found.") {
                                            //   console.log('Waiting for further messages.');
                                            callback(null, context);
                                            // }
                                        } else {
                                            // Our bot did everything it has to do.
                                            // Now it's waiting for further messages to proceed.
                                            console.log('Waiting for further messages.');
                                            console.log("Sender, Context, Msg" + sender + context + msg.message.text);

                                            //We retrieve the intent



                                            if (msg.message.nlp.entities.hasOwnProperty('intent') === true) {
                                                console.log('has intent!');
                                                intent = msg.message.nlp.entities.intent[0].value;
                                            } else {
                                                console.log('has no intent!');
                                            }

                                            if (intent === "recipe" && msg.message.nlp.entities.hasOwnProperty('cuisine') !== true) {
                                                actions.say(sender, context, "What kind of recipe do you search for? What cuisine? For example: african, chinese, japanese, korean, vietnamese, thai, indian, british, irish, french, italian, mexican, spanish, middle eastern, jewish, american, cajun, southern, greek, german, nordic, eastern european, caribbean, or latin american.\"")
                                            }

                                            if (msg.message.nlp.entities.hasOwnProperty('cuisine') === true) {
                                                actions.foodAPIRecipeRequest(sender, context, msg);
                                            } else {
                                                console.log('has no cuisine!');
                                            }

                                            // Based on the session state, you might want to reset the session.
                                            // This depends heavily on the business logic of your bot.
                                            // Example:
                                            // if (context['done']) {
                                            //   delete sessions[sessionId];
                                            // }

                                            // Updating the user's current session state
                                            callback(null, context);
                                        }
                                    }
                                )
                            }
                        } else {
                            //delivery confirmation
                            //mids etc

                            callback(null, {});
                            }
                    },
                ],
                function (err, results) {

                     /*var newContext = sessions[sessionId].context;
                     console.log("Old context", newContext);
                     for (let context_return of results) {

                     newContext = newContext.concat(context_return);
                     console.log("New after adding", context_return, newContext);
                     }

                     sessions[sessionId].context = newContext;*/

                    console.log("Session context", sessions[sessionId].context);
                }
            );
            }
        );
    }
    res.sendStatus(200);
});
