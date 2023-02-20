let dbConfig = require("../Utilities/dbConfig");

let initialize = () => {
    dbConfig.getDB().query("create table IF NOT EXISTS user_master (user_id INT auto_increment primary key, first_name VARCHAR(50), last_name VARCHAR(50), email VARCHAR(50), password VARCHAR(50),status INT,created_at DATETIME)");
}

module.exports = {
    initialize: initialize
}