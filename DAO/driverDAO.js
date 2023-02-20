'use strict';

let dbConfig = require("../Utilities/dbConfig");
let qb = require("../Utilities/dbConfig").qb;


// var FCM = require('fcm-node');
// var driverserverKey = 'AAAABOhrkPQ:APA91bEXkat1xH4M04jKGPHOBZePJQ83n4nD3mSHQXQY8uRbckT5oLzCj4LafFgg7R1LSzvH_s97eoMHw0OyJtV-6xvhn9OLxdLhWOpJm38OAWzR3YSLjsclQ0dKO1Hny4J_lS8P-25t'; //put your server key here
// var driverfcm = new FCM(driverserverKey);
// // var customerserverKey = 'AAAA1SQvy-Y:APA91bH3sNR3AM_KG9XI99rnH6tLPjZOu0AI2ZFlaRU5z6tK5oRy0aL6rzlLWQOyLEWj5SQqy8e2Az1A1YD2fpysWvrbtakqStc6ZAKW163v0hNDXbms2YCCVamitEXSxJes8DzLvCrl';
// var customerserverKey = 'AAAAWjz5A6k:APA91bHiF3GUDdVfhqLsNlwfRfNVCPt-cU6pCDHjxqirwMA-3TA4fDXebFHXUNFEFlGuj5Y2tJr8f8DpkBhpIKfgAMn4Fhfq1zyCSVgtfJqNa9dChwE6UKl6yRZNBgn8b9naWK2cStRC';
// var customerfcm = new FCM(customerserverKey);
// var requestCancelTime = 300000; // 5min


/**** Get User Information *****/

let getUsers = (criteria, callback) => {
    let conditions = "";


    if (criteria.mobile_no) {
        criteria.country_code ? conditions += `country_code = '${criteria.country_code}'` : true;
        criteria.mobile_no ? conditions += `and mobile_no = '${criteria.mobile_no}'` : true;
    }
    if (criteria.user_id) {
        criteria.user_id ? conditions += `user_id = '${criteria.user_id}'` : true;
    }
    criteria.user_type ? conditions += `and user_type = '${criteria.user_type}'` : true;
    criteria.status ? conditions += ` and status = '1'` : true;


    dbConfig.getDB().query(`select * from m_user where ${conditions}`, callback);
}

module.exports = {
    getUsers: getUsers
}