let config = require("./config").config,
    bodyParser = require('body-parser'),
    nodemailer = require('nodemailer'),
    jwt = require('jsonwebtoken'),
    MD5 = require("md5");
let templates = require('../Utilities/templates');
let querystring = require('querystring');
let async = require('async');
let fs = require('fs');
//
const AWS = require('aws-sdk');
var s3 = new AWS.S3();

s3.config.update({
	accessKeyId: 'AKIAQZB4HPZ4MBDHBAOJ',
	secretAccessKey: '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'
});
s3.config.region = 'ap-south-1';
// 

let encryptData = (stringToCrypt) => {
    return MD5(stringToCrypt);
};

let secret = 'SERVICE_KART'
    // Define Error Codes
let statusCode = {
    OK: 200,
    FOUR_ZERO_FOUR: 404,
    INTERNAL_SERVER_ERROR: 400,
    FOUR_ZERO_ONE: 401,
    FOUR_ZERO_ZERO: 400,
    BAD_REQUEST: 404,
    FIVE_ZERO_ZERO: 500,
};

// Define Error Messages
let statusMessage = {
    PARAMS_MISSING: 'Mandatory Fields Missing',
    SERVER_BUSY: 'Our Servers are busy. Please try again later.',
    PAGE_NOT_FOUND: 'Page not found', //404
    NOT_FOUND: 'No Drivers Available',
    DB_ERROR: 'database related error occured', // data base related error...
    GOT_AUDIO_LIST: "Got audio list Successfully",
    INTERNAL_SERVER_ERROR: 'Internal server error.', //500
    SOMETHING_WENT_WRONG: 'Something went wrong.',
    LOGIN_SUCCESS: "Login Successfully.",
    USER_EXIST: "User already exists",
    USER_ADDED: "Signup Successfully",
    MOBILE_EXIST: "Mobile Number already exists",
    SOCIAL_EXIST: "Social Account already exists",
    EMAIL_EXIST: "Email already exists",
    INCORRECT_CREDENTIALS: "Incorrect Credentials.",
    INCORRECT_EMAIL: "Please enter correct email.",
    INCORRECT_USER: "User doesn't exist",
    INCORRECT_PASSWORD: "Please enter correct password.",
    EMAIL_SENT: "email sent for password recovery.",
    INVALID_REQUEST: "Invalid Request.",
    INVALID_TOKEN: "User Authentication Failed. Please login again.",
    PASSWORD_UPDATED: "Congratulations! Password updated successfully.",
    DEVICE_TOKEN_UPDATE: "Device token updated successfully.",
    NEW_EMAIL: "Email Id does not exist",
    NEW_MOBILE: "Mobile number does not exist",
    NEW_USER: "NEW USER",
    OLD_USER: "OLD USER",
    USER_UPDATED: "User Profile updated successfully"
};

let getMysqlDate = (rawDate) => {
    let date = new Date(rawDate);
    return date.getUTCFullYear() + '-' +
        ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
        ('00' + date.getUTCDate()).slice(-2);
}

let jwtDecode = (token, callback) => {
    jwt.verify(token, 'SERVICE_KART', (err, decoded) => {
        if (err) {
            callback(null)
        } else {
            callback(null, decoded.id)
        }
    })
}

let jwtEncode = (auth) => {
    // console.log("token generate")
    var token = jwt.sign({ id: auth }, 'SERVICE_KART', {})
    return token;
}

let scart_Multi_image_upload = (files, callback) => {
	let a = [];
	var i = 0;
	async.eachSeries(files.images, (item, callbackNextIteratn) => {
		let fileData = fs.readFileSync(item.path);
		let fileExtension;
		fileExtension = item.originalFilename.replace(/^.*\./, '');
		i = i + 1;
		let id = new Date().getTime() + i
		let params = {
			Bucket: 'servicekaart',
			Key: `${id}.${fileExtension}`,
			Body: fileData,
			ContentType: item.type,
			ACL: 'public-read'
		};
		s3.putObject(params, function (err, pres) {
			if (err) {
				callback(null)
			} else {
                let url = `https://servicekaart.s3-ap-south-1.amazonaws.com/${id}.${fileExtension}`;
				a.push(url);
				callbackNextIteratn();
			}
		});
	}, (err) => {
		console.log("Done with async loop")
		callback(null, a);
	})
}

module.exports = {
    statusCode: statusCode,
    statusMessage: statusMessage,
    getMysqlDate: getMysqlDate,
    encryptData: encryptData,
    jwtDecode: jwtDecode,
    jwtEncode: jwtEncode,
    scart_Multi_image_upload: scart_Multi_image_upload

}




