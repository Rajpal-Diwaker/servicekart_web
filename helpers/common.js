let fs = require('fs');
require('dotenv').config()
// const config = require('../config/config').config;
// const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
console.log('serverkey==================>')
const FCM = require('fcm-push');
const serverKey = process.env.FCMServer_key;
console.log('serverkey==================>',serverKey)
const fcm = new FCM(serverKey);






let sendNotification = (device_type = null, deviceToken = null, title = null, message = null, notitype = null, badge = null, order_id = null, callback) => {

    if (device_type == 'android') {

        var message = {
            registration_ids: [deviceToken],
            "data": {
                "title": title,
                "type": notitype,
                "msg": message,
                "order_id": order_id?order_id:'',
                "badge": badge?badge:'1'
            },

        };

        fcm.send(message, function(err, response) {
            console.log("notification main error--------->", err, response)
            if (err) {
                console.log("Something has gone wrong!");

                console.log("errror" + err);
            } else {
                console.log("Successfully sent with response: " + response);
            }
        });


    } else if (device_type == 'web') {
       
        var message = {
            registration_ids: [deviceToken],
            "data": {
                "title": title,
                "type": notitype,
                "msg": message,
                "order_id": order_id?order_id:'',
                "badge": badge?badge:'1'
                
            },

        };


        fcm.send(message, function(err, response) {
            console.log("notification main error--------->", err, response)
            if (err) {
                console.log("Something has gone wrong!");

                console.log("errror" + err);
            } else {
                console.log("Successfully sent with response: " + response);
            }
        });

    }


}



module.exports = {
    sendNotification

}