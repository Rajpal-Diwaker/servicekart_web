const jwt = require('jsonwebtoken');
//const config = require('../config/config.dev')
const auth = {
    verifyToken: (req, res, next) => {
        // console.log("req.headers.token-=========>>>>", req.headers.accesstoken , req.body) 
        if (!req.headers.accesstoken || req.headers.accesstoken == "" || req.headers.accesstoken == "") {
            // console.log("token not verified" ,req.headers.accessToken)
            res.send({ "statusCode": "401", "statusMessage": "provide access token " })
        }
        jwt.verify(req.headers.accesstoken, 'SERVICE_KART', (err, decoded) => {
            if (err) {
                res.send({ "statusCode": "501", "statusMessage": "access token related error", "error": err })
            } else {
                // console.log(decoded, "fdhfd")
                next();
            }
        })
    }
};



module.exports = auth;