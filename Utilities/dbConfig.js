var config = require("../Utilities/config").config;
const QueryBuilder = require('node-querybuilder');

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: config.DB_URL.host,
    user: config.DB_URL.user,
    password: config.DB_URL.password,
    database: config.DB_URL.database
});

connection.connect(() => {
    require('../Models/User').initialize();
});


let getDB = () => {
    return connection;
}

const settings = {
"host": config.DB_URL.host,
"user": config.DB_URL.user,
"password": config.DB_URL.password,
"database": config.DB_URL.database
};

const qb = new QueryBuilder(settings, 'mysql', 'single');


module.exports = {
getDB: getDB,
qb
}
