'use strict';

const async = require('async');
const FB = require("./facebook.action");
const unirest = require('unirest');

module.exports = {
    say(recipientId, context, message, cb) {
        console.log("say function executed");
        if (recipientId) {
            // Yay, we found our recipient!
            // Let's forward our bot response to her.

            FB.sendText(recipientId, message, (err, data) => {
                if (err) {
                    console.log(
                        'Oops! An error occurred while forwarding the response to',
                        recipientId,
                        ':',
                        err
                    );
                }
                console.log("sendText function executed");
                // Let's give the wheel back to our bot
                //cb();
            });
        } else {
            console.log('Oops! Couldn\'t find user for session:', sessionId);
            // Giving the wheel back to our bot
            //cb();
        }
    },

    merge(recipientId, context, entities, message, cb) {

        async.forEachOf(entities, (entity, key, cb) => {
            const value = firstEntityValue(entity);
            //console.error("Result", key, value);
            if (value != null && (context[key] == null || context[key] != value)) {

                switch (key) {
                    default:
                        cb();
                }
            }
            else
                cb();

        }, (error) => {
            if (error) {
                console.error(error);
            } else {
                console.log("Context after merge:\n", context);
                cb(context);
            }
        });
    },

    error(recipientId, context, error) {
        console.log(error.message);
    },

    /**** Add your own functions HERE ******/

    'null': ({sessionId, context, text, entities}) => {
        return Promise.resolve();
    },

    foodAPIRecipeRequest(recipientId, context, msg, cb) {

        let imageUrlCombined = [];
        let title = [];
        let readyInMinutes = [];
        let recipeNumberLength = 0;
        let inputCuisine = msg.message.nlp.entities.cuisine[0].value;
        let inputQuery = "";
        let inputDiet = "";
        let inputIntolerance = "";
        let inputType = "";
        let ids = [];

        // These code snippets use an open-source library. http://unirest.io/nodejs
        // 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?cuisine=italian&diet=vegetarian&excludeIngredients=coconut&instructionsRequired=false&intolerances=egg&limitLicense=false&number=10&offset=0&query=pasta&type=main+course'
        // "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?cuisine=italian&diet=vegetarian&excludeIngredients=coconut&instructionsRequired=false&intolerances=sesame&limitLicense=false&number=10&offset=0&query=pasta&type=main+course"
        console.log(recipientId + inputCuisine + inputDiet + inputIntolerance + inputType + inputQuery);
        console.log("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?cuisine=" +
            inputCuisine +
            "&diet=" +
            inputDiet +
            "&excludeIngredients=coconut&instructionsRequired=true&intolerances=" +
            inputIntolerance + "&limitLicense=false&number=10&offset=0&query=" +
            inputQuery +
            "&type=" +
            inputType);

        unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?cuisine=" +
            inputCuisine +
            "&diet=" +
            inputDiet +
            "&excludeIngredients=coconut&instructionsRequired=true&intolerances=" +
            inputIntolerance +
            "&limitLicense=false&number=10&offset=0&query=" +
            inputQuery +
            "&type=" +
            inputType)
            .header("X-Mashape-Key", "M0WkYkVSuvmshQP7S6BBF9BdI3I5p1wSLh3jsnXUQkJCIBbL7d")
            .header("Accept", "application/json")
            .end(function (result) {
                //console.log(result.status, result.headers, result.body);
                //console.log("--------------------->>>>>>>>>>>>:" + JSON.stringify(result.body));
                for (let x = 0; x < result.body.results.length; x++) {
                    let imageUrl = result.body.baseUri;
                    ids.push(result.body.results[x].id);
                    imageUrlCombined.push(imageUrl + result.body.results[x].imageUrls[0]);
                    title.push(result.body.results[x].title);
                    readyInMinutes.push("Ready in minutes:" + result.body.results[x].readyInMinutes);
                    console.log(title[x]);
                    console.log(imageUrlCombined[x]);
                    console.log(readyInMinutes[x]);
                }

                if (title.length === 0) {

                    FB.sendText(recipientId, "There are no recipies for this request available", (err, data) => {
                        if (err) {
                            console.log(
                                'Oops! An error occurred while forwarding the response to',
                                recipientId,
                                ':',
                                err
                            );
                        }
                        console.log("sendText function executed");
                        // Let's give the wheel back to our bot
                        //cb();
                    });
                } else {
                    //console.log('Oops! Couldn\'t find user for session:', sessionId);
                    // Giving the wheel back to our bot
                    //cb();
                }
                console.log(title);
                console.log(imageUrlCombined);
                console.log(readyInMinutes);

                recipeNumberLength = result.body.results.length;
                //console.log("recipeNumberLength ---->" + recipeNumberLength);


                if (recipientId) {
                    // Yay, we found our recipient!
                    // Let's forward our bot response to her.

                    let elements = [
                        {
                            "title": title[0],
                            "image_url": imageUrlCombined[0],
                            "subtitle": readyInMinutes[0],
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            },
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Checkout recipe",
                                    "payload": "DEVELOPER_DEFINED_PAYLOAD-" + ids[0]
                                }
                            ]
                        },
                        {
                            "title": title[1],
                            "image_url": imageUrlCombined[1],
                            "subtitle": readyInMinutes[1],
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            },
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Checkout recipe",
                                    "payload": "DEVELOPER_DEFINED_PAYLOAD-" + ids[1]
                                }
                            ]
                        },
                        {
                            "title": title[2],
                            "image_url": imageUrlCombined[2],
                            "subtitle": readyInMinutes[2],
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            },
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Checkout recipe",
                                    "payload": "DEVELOPER_DEFINED_PAYLOAD-" + ids[2]
                                }
                            ]
                        },
                        {
                            "title": title[3],
                            "image_url": imageUrlCombined[3],
                            "subtitle": readyInMinutes[3],
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            },
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Checkout recipe",
                                    "payload": "DEVELOPER_DEFINED_PAYLOAD-" + ids[3]
                                }
                            ]
                        },
                        {
                            "title": title[4],
                            "image_url": imageUrlCombined[4],
                            "subtitle": readyInMinutes[4],
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            },
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Checkout recipe",
                                    "payload": "DEVELOPER_DEFINED_PAYLOAD-" + ids[4]
                                }
                            ]
                        },
                        {
                            "title": title[5],
                            "image_url": imageUrlCombined[5],
                            "subtitle": readyInMinutes[5],
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            },
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Checkout recipe",
                                    "payload": "DEVELOPER_DEFINED_PAYLOAD-" + ids[5]
                                }
                            ]
                        },
                        {
                            "title": title[6],
                            "image_url": imageUrlCombined[6],
                            "subtitle": readyInMinutes[6],
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            },
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Checkout recipe",
                                    "payload": "DEVELOPER_DEFINED_PAYLOAD-" + ids[6]
                                }
                            ]
                        },
                        {
                            "title": title[7],
                            "image_url": imageUrlCombined[7],
                            "subtitle": readyInMinutes[7],
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            },
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Checkout recipe",
                                    "payload": "DEVELOPER_DEFINED_PAYLOAD-" + ids[7]
                                }
                            ]
                        },
                        {
                            "title": title[8],
                            "image_url": imageUrlCombined[8],
                            "subtitle": readyInMinutes[8],
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            },
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Checkout recipe",
                                    "payload": "DEVELOPER_DEFINED_PAYLOAD-" + ids[8]
                                }
                            ]
                        },
                        {
                            "title": title[9],
                            "image_url": imageUrlCombined[9],
                            "subtitle": readyInMinutes[9],
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            },
                            "buttons": [
                                {
                                    "type": "postback",
                                    "title": "Checkout recipe",
                                    "payload": "DEVELOPER_DEFINED_PAYLOAD-" + ids[9]
                                }
                            ]
                        },

                    ];


                    FB.sendStructuredMessage(recipientId, elements, (err, data) => {
                        if (err) {
                            console.log(
                                'Oops! An error occurred while forwarding the response to',
                                recipientId,
                                ':',
                                err
                            );
                        }
                        console.log("sendText function executed");
                        // Let's give the wheel back to our bot
                        //cb();

                    });
                } else {
                    console.log('Oops! Couldn\'t find user for session:', sessionId);
                    // Giving the wheel back to our bot
                    cb();
                }
            })
        }

};

// Helper function to get the first message
const firstEntityValue = (entity) => {
    const val = entity && Array.isArray(entity) &&
            entity.length > 0 &&
            entity[0].value
        ;
    if (!val) {
        return null;
    }
    return typeof val === 'object' ? val.value : val;
};