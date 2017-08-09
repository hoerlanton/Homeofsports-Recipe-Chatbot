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

    'null': (sessionId, context, cb) => {
        console.log('null called: sessionId' + sessionId + "context" + context);
        cb();
        return Promise.resolve();
    },

    foodAPIRecipeRequest(recipientId, context, message, cb) {

        let imageUrlCombined = [];
        let title = [];
        let readyInMinutes = [];
        let recipeNumberLength = 0;
        let inputCuisine = "";
        let inputDiet = "";
        let inputIntolerance = "";
        let inputType = "";
        let ids = [];

        // These code snippets use an open-source library. http://unirest.io/nodejs
        // 'https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?cuisine=italian&diet=vegetarian&excludeIngredients=coconut&instructionsRequired=false&intolerances=egg&limitLicense=false&number=10&offset=0&query=pasta&type=main+course'
        // "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?cuisine=italian&diet=vegetarian&excludeIngredients=coconut&instructionsRequired=false&intolerances=sesame&limitLicense=false&number=10&offset=0&query=pasta&type=main+course"
        console.log(recipientId + inputCuisine + inputDiet + inputIntolerance + inputType + message);
        console.log("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?cuisine=" +
            inputCuisine +
            "&diet=" +
            inputDiet +
            "&excludeIngredients=coconut&instructionsRequired=true&intolerances=" +
            inputIntolerance + "&limitLicense=false&number=10&offset=0&query=" +
            message +
            "&type=" +
            inputType);

        unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/search?cuisine=" +
            inputCuisine +
            "&diet=" +
            inputDiet +
            "&excludeIngredients=coconut&instructionsRequired=true&intolerances=" +
            inputIntolerance +
            "&limitLicense=false&number=10&offset=0&query=" +
            message +
            "&type=" +
            inputType)
            .header("X-Mashape-Key", "M0WkYkVSuvmshQP7S6BBF9BdI3I5p1wSLh3jsnXUQkJCIBbL7d")
            .header("Accept", "application/json")
            .end(function (result) {
                console.log(result.status, result.headers, result.body);
                //console.log("--------------------->>>>>>>>>>>>:" + JSON.stringify(result.body));
                for (let x = 0; x < result.body.results.length; x++) {
                    let imageUrl = result.body.baseUri;
                    ids.push(result.body.results[x].id);
                    imageUrlCombined.push(imageUrl + result.body.results[x].imageUrls[0]);
                    title.push(result.body.results[x].title);
                    readyInMinutes.push("Ready in minutes:" + result.body.results[x].readyInMinutes);
                    //sendTextMessage(senderId, title);
                    //sendTextMessage(senderId, readyInMinutes);
                    //sendImageMessage(senderId, imageUrlCombined);
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
                console.log("recipeNumberLength ---->" + recipeNumberLength);


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
                        cb();

                    });
                } else {
                    console.log('Oops! Couldn\'t find user for session:', sessionId);
                    // Giving the wheel back to our bot
                    //cb();
                }
            })
        }

    /*

    receiveInputCuisine(message, inputCuisine){
    inputCuisine = message


},

    receiveInputDiet(message, inputDiet){
    inputDiet = message
},

    receiveInputIntolerances(message, inputIntolerance){
    inputIntolerance = message
},

    receiveInputTypes(message, inputType){
    inputType = message.replace(/\W+/g, '+');
},

    receiveInputQuery(message, context, inputQuery){
    inputQuery = message;
},

    resetValues(inputCuisine, inputDiet, inputIntolerance, inputQuery, inputType, ids){
        inputCuisine = "";
        inputDiet = "";
        inputIntolerance = "";
        inputQuery = "";
        inputType = "";
        ids = [];
},

    sendFirstRecipeQuestion(recipientId) {
        var message = {
            recipient: {
                id: recipientId
            },
            message: {
                text: "The cuisine(s) of the recipes? For example: african, chinese, japanese, korean, vietnamese, thai, indian, british, irish, french, italian, mexican, spanish, middle eastern, jewish, american, cajun, southern, greek, german, nordic, eastern european, caribbean, or latin american.",
                metadata: "DEVELOPER_DEFINED_METADATA"
            }
        };
        console.log("sendFirstRecipeQuestion function executed");
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

    sendSecondRecipeQuestion(recipientId){
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Any intolerances? All found recipes must not have ingredients that could cause problems for people with one of the given tolerances - For example: dairy, egg, gluten, peanut, sesame, seafood, shellfish, soy, sulfite, tree nut, and wheat",
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };
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

    sendThirdRecipeQuestion(recipientId){
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Any diets? The diet to which the recipes must be compliant. Possible values are: pescetarian, lacto vegetarian, ovo vegetarian, vegan, and vegetarian.",
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };
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

    sendFourthRecipeQuestion(recipientId){
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "The type of the recipes? One of the following: main course, side dish, dessert, appetizer, salad, bread, breakfast, soup, beverage, sauce, or drink.",
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };
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

    sendFifthRecipeQuestion(recipientId){
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "So what kind of recipepy are looking for. Just write a keyword and we will search. For example: pork",
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };
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

    foodAPIRecipeDetailRequest(senderId, id) {

    var receiptDetail = [];
    var title = [];
    var images = [];
    var ingridientsLength = 0;
    id = id

    console.log("---->" + id);

// These code snippets use an open-source library. http://unirest.io/nodejs
    unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/" + id + "/information?includenutrition=false")
        .header("X-Mashape-Key", "M0WkYkVSuvmshQP7S6BBF9BdI3I5p1wSLh3jsnXUQkJCIBbL7d")
        .header("Accept", "application/json")
        .end(function (result) {
            console.log(result.status, result.headers, result.body);
            //console.log("--------------------->>>>>>>>>>>>:" + JSON.stringify(result.body));
            for (var y = 0; y < result.body.extendedIngredients.length; y++) {
                receiptDetail.push(result.body.extendedIngredients[y]);
                title.push(receiptDetail[y].originalString);
                images.push(receiptDetail[y].image);

                console.log(receiptDetail[y].originalString);
                console.log(receiptDetail[y].image);
            }

            ingridientsLength = result.body.extendedIngredients.length;

            console.log("Receiptdetail: ----->>>>" + receiptDetail);
            console.log("title: ----->>>>" + title);
            console.log("images: ----->>>>" + images);
            console.log("ingredients length ---->>>>>" + ingridientsLength);

            sendListReceiptDetail(senderId, title, images);

            if (ingridientsLength > 4 ) {
                sendListReceiptDetail2(senderId, title, images);
            }
            else if (ingridientsLength > 8 && ingridientsLength < 12) {
                sendListReceiptDetail2(senderId, title, images);
                sendListReceiptDetail3(senderId, title, images);
            }
            else if (ingridientsLength > 12) {
                sendListReceiptDetail2(senderId, title, images);
                sendListReceiptDetail3(senderId, title, images);
                sendListReceiptDetail4(senderId, title, images);
            }
            //var fullInfo = receiptDetail + instructionStepsDetail;
            //sendTextMessage(senderId, JSON.stringify(result.body.analyzedInstructions[0].steps[z]));
        });
},

    foodAPIRecipeDetailStepsRequest(senderId, id) {

    var instructionStepsDetail = [];
    var instructionStepsDetailString = [];
    var instructionStepsNumber = [];

// These code snippets use an open-source library. http://unirest.io/nodejs
    unirest.get("https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/" + id + "/information?includenutrition=false")
        .header("X-Mashape-Key", "M0WkYkVSuvmshQP7S6BBF9BdI3I5p1wSLh3jsnXUQkJCIBbL7d")
        .header("Accept", "application/json")
        .end(function (result) {
            console.log("--------------------------------------------------------------------------------------------");
            //console.log(result.status, result.headers, result.body);
            for (var z = 0; z < result.body.analyzedInstructions[0].steps.length; z++) {
                instructionStepsDetail.push(result.body.analyzedInstructions[0].steps[z].step);
                instructionStepsNumber.push(result.body.analyzedInstructions[0].steps[z].number);
                //sendStepDescription(senderId, instructionStepsDetail[z], instructionStepsNumber[z]);
                //console.log(instructionStepsDetail);
            }
            instructionStepsDetailString = JSON.stringify(instructionStepsDetail);
            //var instr1 = JSON.stringify(instructionStepsDetail[0]);

            //console.log(instructionStepsDetail);
            console.log("instructionStepsDetailString: " + instructionStepsDetailString);
            //console.log(instr1);
            console.log("instructionStepsDetail: "  + instructionStepsDetail.length);

            sendStepDescription(senderId, instructionStepsDetail, instructionStepsNumber);

            if (instructionStepsDetail.length > 1 && instructionStepsDetail.length < 3) {
                setTimeout(sendStepDescription2, 100, senderId, instructionStepsDetail, instructionStepsNumber);

            }
            else if (instructionStepsDetail.length > 2 && instructionStepsDetail.length < 4) {
                setTimeout(sendStepDescription2, 100, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription3, 200, senderId, instructionStepsDetail, instructionStepsNumber);
            }
            else if (instructionStepsDetail.length > 3 && instructionStepsDetail.length < 5) {
                setTimeout(sendStepDescription2, 100, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription3, 200, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription4, 300, senderId, instructionStepsDetail, instructionStepsNumber);
            }
            else if (instructionStepsDetail.length > 4 && instructionStepsDetail.length < 6) {
                setTimeout(sendStepDescription2, 100, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription3, 200, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription4, 300, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription5, 400, senderId, instructionStepsDetail, instructionStepsNumber);
            }
            else if (instructionStepsDetail.length > 5 && instructionStepsDetail.length < 7) {
                setTimeout(sendStepDescription2, 100, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription3, 200, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription4, 300, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription5, 400, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription6, 500, senderId, instructionStepsDetail, instructionStepsNumber);
            }
            else if (instructionStepsDetail.length > 6 && instructionStepsDetail.length < 8) {
                setTimeout(sendStepDescription2, 100, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription3, 200, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription4, 300, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription5, 400, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription6, 500, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription7, 600, senderId, instructionStepsDetail, instructionStepsNumber);
            }
            else if (instructionStepsDetail.length > 8 && instructionStepsDetail.length < 10) {
                setTimeout(sendStepDescription2, 100, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription3, 200, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription4, 300, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription5, 400, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription6, 500, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription7, 600, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription8, 700, senderId, instructionStepsDetail, instructionStepsNumber);
            }
            else if (instructionStepsDetail.length > 9 && instructionStepsDetail.length < 11) {
                setTimeout(sendStepDescription2, 100, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription3, 200, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription4, 300, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription5, 400, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription6, 500, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription7, 600, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription8, 700, senderId, instructionStepsDetail, instructionStepsNumber);
                setTimeout(sendStepDescription9, 800, senderId, instructionStepsDetail, instructionStepsNumber);
            }
        });
},

    sendGenericRequest(recipientId, imageUrlCombined, title, readyInMinutes, ids) {

    var messageData = {
        "recipient": {
            "id": recipientId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
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
                        }
                    ]
                }
            }
        }
    };


    if(title[1]){
        messageData.message.attachment.payload.elements[1] =  {
            "title": title[1] ,
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
        }
    }
    if(title[2]){
        messageData.message.attachment.payload.elements[2] =  {
            "title": title[2] ,
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
                    "payload": "DEVELOPER_DEFINED_PAYLOAD-" + ids[1]
                }
            ]
        }
    }
    if(title[3]){
        messageData.message.attachment.payload.elements[3] =  {
            "title": title[3] ,
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
                    "payload": "DEVELOPER_DEFINED_PAYLOAD-" + ids[1]
                }
            ]
        }
    }
    callSendAPI(messageData);
},

    sendGenericRequest2(recipientId, imageUrlCombined, title, readyInMinutes, ids) {

    var messageData = {
        "recipient": {
            "id": recipientId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
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
                        }
                    ]
                }
            }
        }
    }
    callSendAPI(messageData);
},

    sendGenericRequest3(recipientId, imageUrlCombined, title, readyInMinutes, ids) {

    var messageData = {
        "recipient": {
            "id": recipientId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
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
                        }
                    ]
                }
            }
        }
    }
    callSendAPI(messageData);
},

    sendListReceiptDetail(recipientId, title, images){

    var messageData = {
        "recipient":{
            "id":recipientId
        }, "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "top_element_style": "compact",
                    "elements": [
                        {
                            "title": title[0],
                            "image_url": images[0],
                            "subtitle": "100% Cotton, 200% Comfortable",
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            }
                        }
                    ],
                    "buttons": [
                        {
                            "title": "Checkout Steps",
                            "type": "postback",
                            "payload": "Checkout Steps"
                        }
                    ]
                }
            }
        }
    };
    if(title[1]){
        messageData.message.attachment.payload.elements[1] = {
            "title": title[1],
            "image_url": images[1],
            "subtitle": "",
            "default_action": {
                "type": "web_url",
                "url": "https://servicio.io",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://servicio.io"
            }
        }
    }
    if(title[2]){
        messageData.message.attachment.payload.elements[2] =  {
            "title": title[2] ,
            "image_url": images[2],
            "subtitle": "",
            "default_action": {
                "type": "web_url",
                "url": "https://servicio.io",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://servicio.io"
            }
        }
    }
    if(title[3]){
        messageData.message.attachment.payload.elements[3] =  {
            "title": title[3] ,
            "image_url": images[3],
            "subtitle": "",
            "default_action": {
                "type": "web_url",
                "url": "https://servicio.io",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://servicio.io"
            }
        }
    }
    callSendAPI(messageData);
},

    sendListReceiptDetail2(recipientId, title, images){

    var messageData = {
        "recipient":{
            "id":recipientId
        }, "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "top_element_style": "compact",
                    "elements": [
                        {
                            "title": title[4],
                            "image_url": images[4],
                            "subtitle": "100% Cotton, 200% Comfortable",
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            }
                        }
                    ],
                    "buttons": [
                        {
                            "title": "Checkout Steps",
                            "type": "postback",
                            "payload": "Checkout Steps"
                        }
                    ]
                }
            }
        }
    };
    if(title[5]){
        messageData.message.attachment.payload.elements[1] = {
            "title": title[5],
            "image_url": images[5],
            "subtitle": "",
            "default_action": {
                "type": "web_url",
                "url": "https://servicio.io",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://servicio.io"
            }
        }
    }
    if(title[6]){
        messageData.message.attachment.payload.elements[2] =  {
            "title": title[6] ,
            "image_url": images[6],
            "subtitle": "",
            "default_action": {
                "type": "web_url",
                "url": "https://servicio.io",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://servicio.io"
            }
        }
    }
    if(title[7]){
        messageData.message.attachment.payload.elements[3] =  {
            "title": title[7] ,
            "image_url": images[7],
            "subtitle": "",
            "default_action": {
                "type": "web_url",
                "url": "https://servicio.io",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://servicio.io"
            }
        }
    }
    callSendAPI(messageData);
},

    sendListReceiptDetail3(recipientId, title, images){

    var messageData = {
        "recipient":{
            "id":recipientId
        }, "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "top_element_style": "compact",
                    "elements": [
                        {
                            "title": title[8],
                            "image_url": images[8],
                            "subtitle": "100% Cotton, 200% Comfortable",
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            }
                        }
                    ],
                    "buttons": [
                        {
                            "title": "Checkout Steps",
                            "type": "postback",
                            "payload": "Checkout Steps"
                        }
                    ]
                }
            }
        }
    };
    if(title[9]){
        messageData.message.attachment.payload.elements[1] = {
            "title": title[9],
            "image_url": images[9],
            "subtitle": "",
            "default_action": {
                "type": "web_url",
                "url": "https://servicio.io",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://servicio.io"
            }
        }
    }
    if(title[10]){
        messageData.message.attachment.payload.elements[2] =  {
            "title": title[10] ,
            "image_url": images[10],
            "subtitle": "",
            "default_action": {
                "type": "web_url",
                "url": "https://servicio.io",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://servicio.io"
            }
        }
    }
    if(title[11]){
        messageData.message.attachment.payload.elements[3] =  {
            "title": title[11] ,
            "image_url": images[11],
            "subtitle": "",
            "default_action": {
                "type": "web_url",
                "url": "https://servicio.io",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://servicio.io"
            }
        }
    }
    callSendAPI(messageData);
},

    sendListReceiptDetail4(recipientId, title, images){

    var messageData = {
        "recipient":{
            "id":recipientId
        }, "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "list",
                    "top_element_style": "compact",
                    "elements": [
                        {
                            "title": title[12],
                            "image_url": images[12],
                            "subtitle": "100% Cotton, 200% Comfortable",
                            "default_action": {
                                "type": "web_url",
                                "url": "https://servicio.io",
                                "messenger_extensions": true,
                                "webview_height_ratio": "tall",
                                "fallback_url": "https://servicio.io"
                            }
                        }
                    ],
                    "buttons": [
                        {
                            "title": "Checkout Steps",
                            "type": "postback",
                            "payload": "Checkout Steps"
                        }
                    ]
                }
            }
        }
    };
    if(title[13]){
        messageData.message.attachment.payload.elements[1] = {
            "title": title[13],
            "image_url": images[13],
            "subtitle": "",
            "default_action": {
                "type": "web_url",
                "url": "https://servicio.io",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://servicio.io"
            }
        }
    }
    if(title[14]){
        messageData.message.attachment.payload.elements[2] =  {
            "title": title[14] ,
            "image_url": images[14],
            "subtitle": "",
            "default_action": {
                "type": "web_url",
                "url": "https://servicio.io",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://servicio.io"
            }
        }
    }
    if(title[15]){
        messageData.message.attachment.payload.elements[3] =  {
            "title": title[15] ,
            "image_url": images[15],
            "subtitle": "",
            "default_action": {
                "type": "web_url",
                "url": "https://servicio.io",
                "messenger_extensions": true,
                "webview_height_ratio": "tall",
                "fallback_url": "https://servicio.io"
            }
        }
    }
    callSendAPI(messageData);
},

    sendStepDescription(recipientId, instructionStepsDetail, instructionStepsNumber) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text:  "Step " + instructionStepsNumber[0] + ": " + instructionStepsDetail[0],
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
},

    sendStepDescription2(recipientId, instructionStepsDetail, instructionStepsNumber) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Step " + instructionStepsNumber[1] + ": " + instructionStepsDetail[1],
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
},

    sendStepDescription3(recipientId, instructionStepsDetail, instructionStepsNumber) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Step " + instructionStepsNumber[2] + ": " + instructionStepsDetail[2],
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
},

    sendStepDescription4(recipientId, instructionStepsDetail, instructionStepsNumber) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Step " + instructionStepsNumber[3] + ": " + instructionStepsDetail[3],
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
},

    sendStepDescription5(recipientId, instructionStepsDetail, instructionStepsNumber) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Step " + instructionStepsNumber[4] + ": " + instructionStepsDetail[4],
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
},

    sendStepDescription6(recipientId, instructionStepsDetail, instructionStepsNumber) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Step " + instructionStepsNumber[5] + ": " + instructionStepsDetail[5],
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
},

    sendStepDescription7(recipientId, instructionStepsDetail, instructionStepsNumber) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Step " + instructionStepsNumber[6] + ": " + instructionStepsDetail[6],
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
},

    sendStepDescription8(recipientId, instructionStepsDetail, instructionStepsNumber) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Step " + instructionStepsNumber[7] + ": " + instructionStepsDetail[7],
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
},

    sendStepDescription9(recipientId, instructionStepsDetail, instructionStepsNumber) {
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: "Step " + instructionStepsNumber[8] + ": " + instructionStepsDetail[8],
            metadata: "DEVELOPER_DEFINED_METADATA"
        }
    };

    callSendAPI(messageData);
},

*/

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