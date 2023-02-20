let app = require('express')(),
    express = require('express'),
    server = require('http').Server(app),
    bodyParser = require('body-parser'),
    path = require('path'),
    async = require('async');
vendorDAO = require('./DAO/vendorDAO');
require('dotenv').config();
require('./Utilities/dbConfig');

var helmet = require('helmet')
app.use(helmet())

let userRoute = require('./Routes/user'),
    customerRoute = require('./Routes/customer'),
    util = require('./Utilities/util'),
    config = require("./Utilities/config").config;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "localhost:4200");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next()
});

app.use(function (err, req, res, next) {
    return res.send({ "errorCode": util.statusCode.FOUR_ZERO_ZERO, "errorMessage": util.statusMessage.SOMETHING_WENT_WRONG });
});
app.use('/user', userRoute);
app.use('/customer', customerRoute);


//console.log(process.env)
server.listen(config.NODE_SERVER_PORT.port, function () {
    console.log('Server running on port ' + config.NODE_SERVER_PORT.port);
});