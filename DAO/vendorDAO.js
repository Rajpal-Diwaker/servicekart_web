'use strict';

let dbConfig = require("../Utilities/dbConfig");
let qb = require("../Utilities/dbConfig").qb;


// var FCM = require('fcm-node');
// var driverserverKey = 'AAAABOhrkPQ:APA91bEXkat1xH4M04jKGPHOBZePJQ83n4nD3mSHQXQY8uRbckT5oLzCj4LafFgg7R1LSzvH_s97eoMHw0OyJtV-6xvhn9OLxdLhWOpJm38OAWzR3YSLjsclQ0dKO1Hny4J_lS8P-25t'; //put your server key here
// var driverfcm = new FCM(driverserverKey);

/**** Create User *****/
let createUser = (dataToSet, callback) => {
        dbConfig.getDB().query("insert into s_users set ? ", dataToSet, callback);
    }

/**** Create User Info *****/
let createUserInfo = (dataToSet, callback) => {
        dbConfig.getDB().query("insert into s_vendors set ? ", dataToSet, callback);
    }

/**** Create User Info *****/
let createUserTimings = (dataToSet, callback) => {
    dbConfig.getDB().query("insert into s_vendor_timings set ? ", dataToSet, callback);
}

/**** Get User Information *****/
let getUsers = (criteria, callback) => {
    let conditions = "";

    if (criteria.email_id) {
        criteria.email_id ? conditions += `u.email_id = '${criteria.email_id}'` : true;
    }
    if (criteria.mobile_no) {
        criteria.mobile_no ? conditions += `u.mobile_no = '${criteria.mobile_no}'` : true;
    }
    if (criteria.user_id) {
        criteria.user_id ? conditions += `u.user_id = '${criteria.user_id}'` : true;
    }

    criteria.user_type ? conditions += `and u.user_type = '${criteria.user_type}'` : true;
    conditions += ` and status = '1'`;
    dbConfig.getDB().query(`select u.*,IF((SELECT COUNT(address_id) from s_user_address where user_id = u.user_id )>0,'1','0')as is_address from s_users as u where ${conditions}`, callback);

}


/**** Get User Data *****/

let getUserData = (criteria, callback) => {
    let conditions = "";
    criteria.user_id ? conditions += `u.user_id = '${criteria.user_id}'` : true;
    conditions += ` and u.status = '1'`;
    dbConfig.getDB().query(`select u.*,v.* from s_users as u left join s_vendors as v on u.user_id = v.user_id where ${conditions}`, function(err, res) {
        if (err) {
            callback(err, null)
        } else {
            dbConfig.getDB().query(`SELECT u.day,u.open_time,u.close_time,u.status from s_vendor_timings as u  where user_id = ${criteria.user_id}`, function(err, res1) {
                res['0'].timings = res1 ? res1 : '';
                callback(null, res);
            });

        }
    });


}

/**** Get User Login Data *****/

let getUsersLogin = (criteria, callback) => {
    let conditions = "";

    criteria.email_id ? conditions += `email_id = '${criteria.email_id}'` : true;
    criteria.password ? conditions += ` and password = '${criteria.password}'` : true;
    criteria.user_type ? conditions += ` and user_type = '${criteria.user_type}'` : true;
    criteria.status ? conditions += ` and status = '1'` : true;

    dbConfig.getDB().query(`select u.*,ui.* from s_users as u left join  s_vendors as ui on u.user_id = ui.user_id where  ${conditions}`, callback);

}

/**** Update Device Token *****/

let updateDeviceToken = (criteria, dataToSet, callback) => {

    //update keys 
    let setData = "";
    if (dataToSet.device_token)
        dataToSet.device_token ? setData += `device_token = '${dataToSet.device_token}',` : true;
    dataToSet.device_type ? setData += `device_type = '${dataToSet.device_type}'` : true;

    let conditions = "";
    criteria.user_id ? conditions += `user_id ='${criteria.user_id}'` : true;
    dbConfig.getDB().query(`UPDATE s_users SET ${setData} where ${conditions} `, callback);
}

/**** Update Profile *****/
let updateProfile = (criteria, dataToSet, callback) => {
    //update keys 
    let setData = "";


    dataToSet.profile_pic ? setData += `profile_pic = '${dataToSet.profile_pic}',` : true;
    if (dataToSet.country_code) {
        dataToSet.country_code ? setData += `country_code = '${dataToSet.country_code}',` : true;
    }
    dataToSet.mobile_no ? setData += `mobile_no = '${dataToSet.mobile_no}',` : true;
    dataToSet.email_id ? setData += `email_id = '${dataToSet.email_id}'` : true;

    let conditions = "";
    criteria.user_id ? conditions += `user_id ='${criteria.user_id}'` : true;

    dbConfig.getDB().query(`UPDATE s_users SET ${setData} where ${conditions} `, null);

    let setData1 = "";
    dataToSet.store_name ? setData1 += `store_name = '${dataToSet.store_name}'` : true;
    dataToSet.store_address ? setData1 += `,store_address = '${dataToSet.store_address}'` : true;
    dataToSet.minimum_order ? setData1 += `,minimum_order = '${dataToSet.minimum_order}'` : true;
    dataToSet.twitter_profile ? setData1 += `,twitter_profile = '${dataToSet.twitter_profile}'` : true;
    dataToSet.instagram_profile ? setData1 += `,instagram_profile	 = '${dataToSet.instagram_profile	}'` : true;
    dataToSet.facebook_profile ? setData1 += `,facebook_profile = '${dataToSet.facebook_profile}'` : true;

    dbConfig.getDB().query(`UPDATE s_vendors SET ${setData1} where ${conditions} `, callback);

}

/**** Update Store Timings *****/

let updateStoreTimings = (criteria, dataToSet, callback) => {

    //update keys 
    let setData = "";
    dataToSet.open_time ? setData += `open_time = '${dataToSet.open_time}',` : true;
    dataToSet.close_time ? setData += `close_time = '${dataToSet.close_time}',` : true;
    dataToSet.status ? setData += `status = '${dataToSet.status}'` : true;

    let conditions = "";
    criteria.user_id ? conditions += `user_id ='${criteria.user_id}'` : true;
    criteria.day ? conditions += ` AND day ='${criteria.day}'` : true;
    dbConfig.getDB().query(`UPDATE s_vendor_timings SET ${setData} where ${conditions} `, callback);
}

/**** Add delivery charges *****/

let addDeliveryCharge = (criteria, dataToSet, callback) => {

    //update keys 
    let setData = "";
    dataToSet.base_delivery_charge ? setData += `base_delivery_charge = '${dataToSet.base_delivery_charge}',` : true;
    dataToSet.delivery_charge_per_km ? setData += `delivery_charge_per_km = '${dataToSet.delivery_charge_per_km}'` : true;

    let conditions = "";
    criteria.user_id ? conditions += `user_id ='${criteria.user_id}'` : true;
    dbConfig.getDB().query(`UPDATE s_vendors SET ${setData} where ${conditions} `, callback);
}

/**** Create delivery executive *****/
let addDeliveryExecutive = (dataToSet, callback) => {
    dbConfig.getDB().query("insert into s_delivery_boy set ? ", dataToSet, callback);
}

/**** Get delivery executive list *****/
let getVendorList = (criteria, callback) => {
    let conditions = "";
    criteria.user_id ? conditions += `u.vendor_id = '${criteria.user_id}'` : true;
    dbConfig.getDB().query(`select u.* from s_delivery_boy as u where ${conditions}`, callback);
}

/**** Get delivery data *****/
let getDeliveryData = (criteria, callback) => {
    let conditions = "";
    criteria.user_id ? conditions += `u.user_id = '${criteria.user_id}'` : true;
    dbConfig.getDB().query(`select u.base_delivery_charge,delivery_charge_per_km from s_vendors as u where ${conditions}`, callback);
}


module.exports = {
    createUser: createUser,
    createUserInfo: createUserInfo,
    createUserTimings: createUserTimings,
    getUsers: getUsers,
    getUserData: getUserData,
    getUsersLogin: getUsersLogin,
    updateDeviceToken: updateDeviceToken,
    updateProfile: updateProfile,
    updateStoreTimings: updateStoreTimings,
    addDeliveryCharge: addDeliveryCharge,
    addDeliveryExecutive: addDeliveryExecutive,
    getVendorList: getVendorList,
    getDeliveryData: getDeliveryData

}