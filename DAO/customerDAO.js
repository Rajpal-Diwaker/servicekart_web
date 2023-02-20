'use strict';

let dbConfig = require("../Utilities/dbConfig");
let qb = require("../Utilities/dbConfig").qb;
const request = require('request');
let moment = require('moment');



/**** Create User *****/
let createUser = (dataToSet, callback) => {
    dbConfig.getDB().query("insert into s_users set ? ", dataToSet, callback);
}

/**** Create User Info *****/
let createUserInfo = (dataToSet, callback) => {
    dbConfig.getDB().query("insert into s_vendors set ? ", dataToSet, callback);
}

/**** Add Address *****/
let addAddress = (dataToSet, callback) => {
    dbConfig.getDB().query("insert into s_user_address set ? ", dataToSet, callback);
}

/**** Add Notification *****/
let addNotification = (dataToSet, callback) => {
    dbConfig.getDB().query("insert into s_notifications set ? ", dataToSet, callback);
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
    if (criteria.social_id) {
        criteria.social_id ? conditions += `u.social_id = '${criteria.social_id}'` : true;
    }
    if (criteria.account_type) {
        criteria.account_type ? conditions += `and u.account_type = '${criteria.account_type}'` : true;
    }

    criteria.user_type ? conditions += `and u.user_type = '${criteria.user_type}'` : true;
    conditions += ` and status = '1'`;
    dbConfig.getDB().query(`select u.*,IF((SELECT COUNT(address_id) from s_user_address where user_id = u.user_id )>0,'1','0') as is_address from s_users as u where ${conditions}`, callback);

}

/**** Get User Information *****/
let getMobileUsers = (criteria, callback) => {
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
    if (criteria.social_id) {
        criteria.social_id ? conditions += `u.social_id = '${criteria.social_id}'` : true;
    }
    if (criteria.account_type) {
        criteria.account_type ? conditions += `and u.account_type = '${criteria.account_type}'` : true;
    }

    //criteria.user_type ? conditions += `and u.user_type = '${criteria.user_type}'` : true;
    conditions += ` and status = '1'`;
    dbConfig.getDB().query(`select u.* from s_users as u where ${conditions}`, callback);

}

/**** Get coupon code *****/
let checkCouponCode = (criteria, callback) => {
    
    dbConfig.getDB().query(`SELECT discount_type,discount_value,min_order_value,coupon_code,coupon_type FROM s_promotions WHERE vendor_id = ${criteria.vendor_id} and coupon_code = '${criteria.coupon_code}' and status = '1' limit 1`, callback);

}


/**** Get User Information *****/
let getUsersDetails = (criteria, callback) => {
    let conditions = "";

    if (criteria.user_id) {
        criteria.user_id ? conditions += `u.user_id = '${criteria.user_id}'` : true;
    }
    
    criteria.user_type ? conditions += `and u.user_type = '${criteria.user_type}'` : true;
    conditions += ` and status = '1'`;
    dbConfig.getDB().query(`select u.user_id,u.first_name,u.last_name,u.profile_pic,IF((SELECT COUNT(address_id) from s_user_address where user_id = u.user_id )>0,'1','0') as is_address from s_users as u where ${conditions}`, function (err, res) {
           if(err){
            callback(err, null)
           }
           else{
          dbConfig.getDB().query(`SELECT * FROM s_user_address WHERE user_id = ${criteria.user_id} and status = '1' limit 1`, function (erra, resa) {
            if (erra) {
                callback(erra, null)
            } else {
                if (resa && resa.length > 0) {
                    res['0'].address = resa ? resa : {};
                    callback(null, res);
                }else{
                 
                    dbConfig.getDB().query(`SELECT * FROM s_user_address WHERE user_id = ${criteria.user_id} ORDER BY address_id desc limit 1`, function (errad, resad) {
                        if (errad) {
                            callback(err, null)
                        } else {
                            if (resad && resad.length > 0) {
                                res['0'].address = resad ? resad : {};
                            }else{
                                res['0'].address = {};
                            }
                            callback(null, res);
                            
                        }
                    });

                } 
                
            }
        });
    }
    })



}

/**** Get User Data *****/

let getUserData = (criteria, callback) => {
    let conditions = "";
    criteria.user_id ? conditions += `user_id = '${criteria.user_id}'` : true;
    conditions += ` and status = '1'`;
    dbConfig.getDB().query(`select u.* from s_users as u where ${conditions}`, callback);
}

/**** Get wallet history *****/

let getWalletHistory = (criteria, callback) => {
    let conditions = "";
    criteria.user_id ? conditions += `user_id = '${criteria.user_id}'` : true;
    dbConfig.getDB().query(`select u.* from s_wallet_history as u where ${conditions}`, callback);
}

/**** Get customer addresses *****/

let getAddresses = (criteria, callback) => {
    let conditions = "";
    criteria.user_id ? conditions += `a.user_id = '${criteria.user_id}'` : true;
    conditions += ` and a.is_deleted = '0'`;
    dbConfig.getDB().query(`select a.* from s_user_address as a where ${conditions} order by address_id desc`, callback);
}

/**** Get recent customer addresses *****/

let getCustomerRecentAddresses = (criteria, callback) => {
    let conditions = "";
    criteria.user_id ? conditions += `a.user_id = '${criteria.user_id}'` : true;
    conditions += ` and a.is_deleted = '0'`;
    dbConfig.getDB().query(`select a.* from s_user_address as a where ${conditions} order by address_id desc limit 5`, callback);
}

/**** Get category list *****/

// let getCategory = (criteria, callback) => {
//     let conditions = "";
//     criteria.user_id ? conditions += `a.user_id = '${criteria.user_id}'` : true;
//     conditions += ` and a.is_deleted = '0'`;
//     dbConfig.getDB().query(`select a.* from s_business_category as a where status='1' order by category_name asc`, callback);
// }

/**** Get category list *****/

// let getCategory = (criteria, callback) => {
//     let conditions = "";
//     criteria.user_id ? conditions += `a.user_id = '${criteria.user_id}'` : true;
//     conditions += ` and a.is_deleted = '0'`;
//     dbConfig.getDB().query(`select a.id,a.name as category_name,a.description,a.category_image as image,a.status,a.added_on  from s_categories as a where status='1' order by a.name asc`, callback);
// }

/**** Get category list *****/

let getCategory = (criteria, callback) => {
    let conditions = "";
    //criteria.category_id ? conditions += `v.category_id = '${criteria.category_id}'` : true;
    conditions += `u.status = '1' and n.service_type = '${criteria.service_type}'`;
    dbConfig.getDB().query(`select DISTINCT a.id,a.name as category_name,a.description,a.category_image as image,a.status,a.added_on from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_inventory as n on u.user_id = n.vendor_id left join s_categories as a on n.category_id = a.id where ${conditions} and round(( 6371 * acos( cos( radians('${criteria.lat}') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('${criteria.lng}') ) + sin( radians('${criteria.lat}') ) * sin( radians( v.lat ) ) ) )) < 10 `, async function (err, res) {
        console.log('errrrrr-------->',res)
        if (err) {
            callback(err, null)
        }
        else {
            
           callback(null, res);
        }
    });
}

/**** Get category list *****/

let getCategoryData = (criteria, callback) => {
    let conditions = "";
    criteria.user_id ? conditions += `a.user_id = '${criteria.user_id}'` : true;
    conditions += ` and a.is_deleted = '0'`;
    dbConfig.getDB().query(`select id,a.name as category_name,a.description,a.category_image as image,a.status,a.added_on  from s_categories as a where status='1' order by a.name asc limit 4`, callback);
}

/**** Get Banner list Top*****/

let getBannerTop = (criteria, callback) => {
    let conditions = "";
    //criteria.user_id ? conditions += `a.user_id = '${criteria.user_id}'` : true;
    let today = new Date();
    let todayDate = moment(today).format('YYYY-MM-DD');
    console.log('date---------->',todayDate)
    //conditions += ` and a.status = '1' and `;
    dbConfig.getDB().query(`select a.* from s_promotions as a where status='1' and banner_path = 'top' and start_date <= '${todayDate}' and end_date >=  '${todayDate}' and banner_type = 'web' order by banner_priority asc limit 5`,  async function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            let limitx = 0;
            if(res && res.length<5){
                limitx = 5 - res.length;
            }
             if(limitx > 0){

                let conditions2 = `u.status = '1' and banner_path = 'top' and banner_type = 'vendor'`;
                await dbConfig.getDB().query(`select DISTINCT n.*,round(( 6371 * acos( cos( radians('${criteria.lat}') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('${criteria.lng}') ) + sin( radians('${criteria.lat}') ) * sin( radians( v.lat ) ) ) )) AS distance from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_promotions as n on u.user_id = n.vendor_id where ${conditions2} and  n.start_date <= '${todayDate}' and n.end_date >=  '${todayDate}' HAVING distance < 10 ORDER BY n.banner_priority limit ${limitx}`, function (err2, res2) {
                    if (err2) {
                       callback(err2, null)
                    }
                    else {
                        let j=0;
                     for (var i=0; i<res2.length; i++){
                       res.push(res2[j])
                       j++
                     }
                     callback(null, res);
                    }

                });
            }else{
               
                let conditions2 = `u.status = '1' and n.banner_path = 'top' and n.banner_type = 'vendor'`;
                dbConfig.getDB().query(`select DISTINCT n.*,round(( 6371 * acos( cos( radians('${criteria.lat}') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('${criteria.lng}') ) + sin( radians('${criteria.lat}') ) * sin( radians( v.lat ) ) ) )) AS distance from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_promotions as n on u.user_id = n.vendor_id where ${conditions2} and n.start_date <= '${todayDate}' and n.end_date >=  '${todayDate}' and (n.external_url = 'NULL' or n.external_url = '') HAVING distance < 10 ORDER BY n.banner_priority limit 5`,  function (err2, res2) {
                    if (err2) {
                        callback(err2, null)
                    }
                    else {
                        console.log('res0x==================',res)
                        callback(null, res2);
                    }

                });

            }
            
         }
    });
}

/**** Get Banner list Mid Top *****/

let getBannerMidTop = (criteria, callback) => {
    let conditions = "";
    //criteria.user_id ? conditions += `a.user_id = '${criteria.user_id}'` : true;
    let today = new Date();
    let todayDate = moment(today).format('YYYY-MM-DD');
    console.log('date---------->',todayDate)
    //conditions += ` and a.status = '1' and `;
    
    dbConfig.getDB().query(`select a.* from s_promotions as a where status='1' and banner_path = 'middle-top' and start_date <= '${todayDate}' and end_date >=  '${todayDate}' and banner_type = 'web' order by banner_priority asc limit 5`,  async function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            let limitx = 0;
            if(res && res.length<5){
                limitx = 5 - res.length;
            }
             if(limitx > 0){

                let conditions2 = `u.status = '1' and n.banner_path = 'middle-top' and n.banner_type = 'vendor'`;

                dbConfig.getDB().query(`select DISTINCT n.*,round(( 6371 * acos( cos( radians('${criteria.lat}') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('${criteria.lng}') ) + sin( radians('${criteria.lat}') ) * sin( radians( v.lat ) ) ) )) AS distance from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_promotions as n on u.user_id = n.vendor_id where ${conditions2} and  n.start_date <= '${todayDate}' and n.end_date >=  '${todayDate}' HAVING distance < 10 ORDER BY n.banner_priority limit ${limitx}`, function (err2, res2) {
                    if (err2) {
                       callback(err2, null)
                    }
                    else {
                        let j=0;
                     for (var i=0; i<res2.length; i++){
                       res.push(res2[j])
                       j++
                     }
                     console.log('res==================',res)
                     callback(null, res);
                    }

                });
            }else{
               
                let conditions2 = `u.status = '1' and n.banner_path = 'middle-top' and n.banner_type = 'vendor'`;
                dbConfig.getDB().query(`select DISTINCT n.*,round(( 6371 * acos( cos( radians('${criteria.lat}') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('${criteria.lng}') ) + sin( radians('${criteria.lat}') ) * sin( radians( v.lat ) ) ) )) AS distance from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_promotions as n on u.user_id = n.vendor_id where ${conditions2} and n.start_date <= '${todayDate}' and n.end_date >=  '${todayDate}' and (n.external_url = 'NULL' or n.external_url = '') HAVING distance < 10 ORDER BY n.banner_priority limit 5`,  function (err2, res2) {
                    if (err2) {
                        callback(err2, null)
                    }
                    else {
                        console.log('res1x==================',res)
                        callback(null, res2);
                    }

                });

            }
            
         }
    });
}

/**** Get Banner list Mid Bottom*****/

let getBannerMidBottom = (criteria, callback) => {
    let conditions = "";
    //criteria.user_id ? conditions += `a.user_id = '${criteria.user_id}'` : true;
    let today = new Date();
    let todayDate = moment(today).format('YYYY-MM-DD');
    console.log('date---------->',todayDate)
    //conditions += ` and a.status = '1' and `;
    
    dbConfig.getDB().query(`select a.* from s_promotions as a where status='1' and banner_path = 'middle-bottom' and start_date <= '${todayDate}' and end_date >=  '${todayDate}' and banner_type = 'web' order by banner_priority asc limit 5`,  async function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            let limitx = 0;
            if(res && res.length<5){
                limitx = 5 - res.length;
            }
             if(limitx > 0){

                let conditions2 = `u.status = '1' and n.banner_path = 'middle-bottom' and n.banner_type = 'vendor'`;

                dbConfig.getDB().query(`select DISTINCT n.*,round(( 6371 * acos( cos( radians('${criteria.lat}') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('${criteria.lng}') ) + sin( radians('${criteria.lat}') ) * sin( radians( v.lat ) ) ) )) AS distance from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_promotions as n on u.user_id = n.vendor_id where ${conditions2} and  n.start_date <= '${todayDate}' and n.end_date >=  '${todayDate}' HAVING distance < 10 ORDER BY n.banner_priority limit ${limitx}`, function (err2, res2) {
                    if (err2) {
                       callback(err2, null)
                    }
                    else {
                        let j=0;
                     for (var i=0; i<res2.length; i++){
                       res.push(res2[j])
                       j++
                     }
                     console.log('res==================',res)
                     callback(null, res);
                    }

                });
            }else{
               
                let conditions2 = `u.status = '1' and n.banner_path = 'middle-bottom' and n.banner_type = 'vendor'`;
                dbConfig.getDB().query(`select DISTINCT n.*,round(( 6371 * acos( cos( radians('${criteria.lat}') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('${criteria.lng}') ) + sin( radians('${criteria.lat}') ) * sin( radians( v.lat ) ) ) )) AS distance from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_promotions as n on u.user_id = n.vendor_id where ${conditions2} and n.start_date <= '${todayDate}' and n.end_date >=  '${todayDate}' and (n.external_url = 'NULL' or n.external_url = '') HAVING distance < 10 ORDER BY n.banner_priority limit 5`,  function (err2, res2) {
                    if (err2) {
                        callback(err2, null)
                    }
                    else {
                        console.log('res==================',res)
                        callback(null, res2);
                    }

                });

            }
            
         }
    });
}

/**** Get Banner list Bottom *****/

let getBannerBottom = (criteria, callback) => {
    let conditions = "";
    //criteria.user_id ? conditions += `a.user_id = '${criteria.user_id}'` : true;
    let today = new Date();
    let todayDate = moment(today).format('YYYY-MM-DD');
    console.log('date---------->',todayDate)
    //conditions += ` and a.status = '1' and `;
    
    dbConfig.getDB().query(`select a.* from s_promotions as a where status='1' and banner_path = 'bottom' and start_date <= '${todayDate}' and end_date >=  '${todayDate}' and banner_type = 'web' order by banner_priority asc limit 5`,  async function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            let limitx = 0;
            if(res && res.length<5){
                limitx = 5 - res.length;
            }
             if(limitx > 0){

                let conditions2 = `u.status = '1' and n.banner_path = 'bottom' and n.banner_type = 'vendor'`;

                dbConfig.getDB().query(`select DISTINCT n.*,round(( 6371 * acos( cos( radians('${criteria.lat}') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('${criteria.lng}') ) + sin( radians('${criteria.lat}') ) * sin( radians( v.lat ) ) ) )) AS distance from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_promotions as n on u.user_id = n.vendor_id where ${conditions2} and  n.start_date <= '${todayDate}' and n.end_date >=  '${todayDate}' HAVING distance < 10 ORDER BY n.banner_priority limit ${limitx}`, function (err2, res2) {
                    if (err2) {
                       callback(err2, null)
                    }
                    else {
                        let j=0;
                     for (var i=0; i<res2.length; i++){
                       res.push(res2[j])
                       j++
                     }
                     console.log('res==================',res)
                     callback(null, res);
                    }

                });
            }else{
               
                let conditions2 = `u.status = '1' and n.banner_path = 'bottom' and n.banner_type = 'vendor'`;
                dbConfig.getDB().query(`select DISTINCT n.*,round(( 6371 * acos( cos( radians('${criteria.lat}') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('${criteria.lng}') ) + sin( radians('${criteria.lat}') ) * sin( radians( v.lat ) ) ) )) AS distance from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_promotions as n on u.user_id = n.vendor_id where ${conditions2} and n.start_date <= '${todayDate}' and n.end_date >=  '${todayDate}' and (n.external_url = 'NULL' or n.external_url = '') HAVING distance < 10 ORDER BY n.banner_priority limit 5`,  function (err2, res2) {
                    if (err2) {
                        callback(err2, null)
                    }
                    else {
                        console.log('res==================',res)
                        callback(null, res2);
                    }

                });

            }
            
         }
    });
}

/**** Get User Login Data *****/

let getUsersLogin = (criteria, callback) => {
    let conditions = "";
    criteria.mobile_no ? conditions += `u.mobile_no = '${criteria.mobile_no}'` : true;
    // criteria.password ? conditions += ` and password = '${criteria.password}'` : true;
    criteria.user_type ? conditions += ` and u.user_type = '${criteria.user_type}'` : true;
    conditions += ` and u.status = '1'`;
    dbConfig.getDB().query(`select u.* from s_users as u where  ${conditions}`, callback);

}

/**** Update Device Token *****/

let updateAddress = (dataToSet, criteria, compData, callback) => {

    let conditions = "";
    criteria.user_id ? conditions += `user_id ='${criteria.user_id}'` : true;
    compData.address_id ? conditions += `and address_id ='${compData.address_id}'` : true;
    dbConfig.getDB().query(`UPDATE s_user_address SET ? where ${conditions} `, dataToSet, callback);
}

/**** Add wallet *****/

let addWalletAmount = (criteria, callback) => {

    //update keys
    let setData = "";
    setData += `wallet = wallet+${criteria.amount}`;
    let conditions = "";
    criteria.user_id ? conditions += `user_id ='${criteria.user_id}'` : true;
    dbConfig.getDB().query(`UPDATE s_users SET ${setData} where ${conditions} `, callback);
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

/**** Update Device Token *****/

let changeAddress = (criteria, callback) => {

    //update keys 
    let setData = "";
    let setData2 = "";
    setData += `status = '1'`;
    setData2 += `status = '0'`;

    let conditions = "";
    criteria.user_id ? conditions += `user_id ='${criteria.user_id}' and address_id ='${criteria.address_id}'` : true;

    let conditions2 = "";
    criteria.user_id ? conditions2 += `user_id ='${criteria.user_id}'` : true;

    dbConfig.getDB().query(`UPDATE s_user_address SET ${setData2} where ${conditions2} `, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            dbConfig.getDB().query(`UPDATE s_user_address SET ${setData} where ${conditions} `, callback);
        }
    });


}

/**** Update Profile *****/
let updateProfile = (criteria, dataToSet, callback) => {

    //update keys 
    // let setData = "";
    // dataToSet.name ? setData += `name = '${dataToSet.name}'` : true;
    // if (dataToSet.country_code) {
    //     dataToSet.country_code ? setData += `,country_code = '${dataToSet.country_code}'` : true;
    // }
    // dataToSet.mobile_no ? setData += `,mobile_no = '${dataToSet.mobile_no}'` : true;
    // dataToSet.profile_pic ? setData += `,user_image = '${dataToSet.profile_pic}'` : true;
    // dataToSet.lat ? setData += `,lat = '${dataToSet.lat}'` : true;
    // dataToSet.lng ? setData += `,lng = '${dataToSet.lng}'` : true;

    let conditions = "";
    criteria.user_id ? conditions += `user_id ='${criteria.user_id}'` : true;

    dbConfig.getDB().query(`UPDATE s_users SET ? where ${conditions} `, dataToSet, callback);

}

/**** store detail *****/
let getStoreDetail = (criteria, callback) => {
    let conditions = "";
    criteria.user_id ? conditions += `u.user_id = '${criteria.user_id}'` : true;
    conditions += ` and u.status = '1'`;
    dbConfig.getDB().query(`select u.user_id,u.profile_pic,v.lat,v.lng,v.store_name,v.store_type from s_users as u left join s_vendors as v on u.user_id = v.user_id where ${conditions}`, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            if (criteria.tab == 'about') {
                dbConfig.getDB().query(`select v.description from s_users as u left join s_vendors as v on u.user_id = v.user_id where ${conditions}`, function (err, res1) {
                    if (res && res.length)
                        res['0'].about = res1 ? res1 : [];

                    callback(null, res);
                });
            }
            else if (criteria.tab == 'item') {
                let conditionsItem = "";
                criteria.user_id ? conditionsItem += `i.vendor_id = '${criteria.user_id}'` : true;
                conditionsItem += ` and i.status = '1'`;
                if (criteria.service_type && criteria.service_type == 'instant') {
                    conditionsItem += ` and i.service_type = 'instant'`;
                } else {
                    conditionsItem += ` and i.service_type = 'daily'`;
                }

                dbConfig.getDB().query(`select i.id as item_id,i.vendor_id,i.item_image,i.name,i.service_type,v.id as variant_id,i.subscription_type,i.in_stock,i.eta,v.unit_price,v.unit_qty,v.unit_type,IFNULL(vc.quantity, 0) as cart_quantity from s_inventory as i left join s_inventory_variants as v on i.id = v.item_id left join s_cart_items as vc on vc.variant_id = v.id where ${conditionsItem} and v.id = (select id from s_inventory_variants where item_id=i.id order by unit_price asc limit 1) order by i.id desc`, function (err, res1) {
                    if (res && res.length)
                        res['0'].item = res1 ? res1 : [];
                    callback(null, res);
                });
            }
            //'s_cart_items'
            else {
                let conditionscat = "";
                criteria.user_id ? conditionscat += `i.vendor_id = '${criteria.user_id}'` : true;
                conditionscat += ` and i.status = '1'`;

                dbConfig.getDB().query(`select i.id as item_id,i.vendor_id,c.id as category_id,c.name,c.category_image from s_inventory as i left join s_categories as c on i.category_id = c.id where ${conditionscat} group by i.category_id order by c.name asc`, function (err, res1) {
                    if (res && res.length)
                        res['0'].category = res1 ? res1 : [];

                    callback(null, res);
                });
            }
        }
    });
}

/**** store detail *****/
let getAllStore = (criteria, callback) => {
    let conditions = "";
    criteria.category_id ? conditions += `n.category_id = '${criteria.category_id}'` : true;
    conditions += ` and u.status = '1'`;
    dbConfig.getDB().query(`select DISTINCT u.user_id,u.profile_pic,v.lat,v.lng,v.store_name,v.store_type,round(( 6371 * acos( cos( radians('${criteria.lat}') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('${criteria.lng}') ) + sin( radians('${criteria.lat}') ) * sin( radians( v.lat ) ) ) )) AS distance from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_inventory as n on u.user_id = n.vendor_id where ${conditions} HAVING distance < 10 ORDER BY distance`, async function (err, res) {
        console.log('err++++++++++++',err)
        //GROUP BY u.user_id
        if (err) {
            callback(err, null)
        }
        else {
            // let getdistime;
            // if (res && res.length > 0) {
            //     res.forEach(async element => {
            //         getdistime = await new Promise((resolve, reject) => {
            //             request(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${criteria.lat},${criteria.lng}&destinations=${element.lat},${element.lng}&key=AIzaSyC3k63UyxqEz5Ma1KHbQ215QUZ83CtsYo8&sensor=false`, function (error, response, body) {
            //                 console.error('error:', error); 
            //                 console.log('statusCode:', response && response.statusCode);
            //                 console.log('body:', body); 
            //                 if (response && response.status != '200') {
            //                     resolve('')
            //                 } else {
            //                     if (response && response.status == '200') {
            //                         resolve(JSON.parse(body))
            //                     } else {
            //                         resolve('')
            //                     }
            //                 }

            //                 // let ab = JSON.parse(body);

            //             });
            //             console.log('------------->', getdistime)
            //             if (getdistime.status == 'OK') {

            //                 element.distance_km = getdistime.rows[0].elements[0].distance.text ? getdistime.rows[0].elements[0].distance.text : '';
            //                 element.time = getdistime.rows[0].elements[0].duration.text ? getdistime.rows[0].elements[0].duration.text : '';

            //             } else {

            //                 element.distance_km = '';
            //                 element.time = '';

            //             }

            //         });

            //         // element.distance = '3 km';
            //         // element.time = '40 min';
            //     });
            // }

            for (let item = 0; item < res.length; item++) {
                let distime;
                await getDistanceTime(res[item]).then(res => {
                    distime = res
                }).catch(err => {
                    distime = 0;
                })

                if (distime.status == 'OK') {

                    res[item].distance_km = distime.rows[0].elements[0].distance.text ? distime.rows[0].elements[0].distance.text : '';
                    res[item].time = distime.rows[0].elements[0].duration.text ? distime.rows[0].elements[0].duration.text : '';

                } else {

                    res[item].distance_km = '';
                    res[item].time = '';

                }

                console.log('++++++++++++++++++++', distime)

            }




            async function getDistanceTime(data) {
                return new Promise((resolve, reject) => {
                    request(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${criteria.lat},${criteria.lng}&destinations=${data.lat},${data.lng}&key=AIzaSyC3k63UyxqEz5Ma1KHbQ215QUZ83CtsYo8&sensor=false`, function (error, response, body) {
                        // console.error('error:', error);
                        // console.log('statusCode:', response && response.statusCode);
                        // console.log('body:', body);
                        if (response && response.statusCode != '200') {
                            resolve('0')
                        } else {
                            if (response && response.statusCode == '200') {
                                resolve(JSON.parse(body))
                            } else {
                                resolve('0')
                            }
                        }

                        // let ab = JSON.parse(body);

                    });
                })
            }


            callback(null, res);
        }
    });
}


/**** store detail *****/
let getDailyServices = (criteria, callback) => {
    let conditions = "";
    //criteria.category_id ? conditions += `v.category_id = '${criteria.category_id}'` : true;
    conditions += `u.status = '1' and n.service_type = 'daily'`;
    dbConfig.getDB().query(`select DISTINCT a.id,a.name as category_name,a.description,a.category_image as image,a.status,a.added_on from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_inventory as n on u.user_id = n.vendor_id left join s_categories as a on n.category_id = a.id where ${conditions} and round(( 6371 * acos( cos( radians('${criteria.lat}') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('${criteria.lng}') ) + sin( radians('${criteria.lat}') ) * sin( radians( v.lat ) ) ) )) < 10 limit 4`, async function (err, res) {
        if (err) {
            callback(err, null)
        }
        else {
            
           callback(null, res);
        }
    });
}

// `select a.id,a.name as category_name,a.description,a.category_image as image,a.status,a.added_on,n.vendor_id,round(( 6371 * acos( cos( radians('28.6706933') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('77.12847649999999') ) + sin( radians('28.6706933') ) * sin( radians( v.lat ) ) ) )) AS distance from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_inventory as n on u.user_id = n.vendor_id left join s_categories as a on n.category_id = a.id where u.status = '1' and n.service_type = 'instant' and n.status = '1' HAVING distance < 10 ORDER BY distance limit 4`

// `select a.id,a.name as category_name,a.description,a.category_image as image,a.status,a.added_on,n.vendor_id,round(( 6371 * acos( cos( radians('28.6706933') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('77.12847649999999') ) + sin( radians('28.6706933') ) * sin( radians( v.lat ) ) ) )) AS distance from s_categories left join s_inventory as n on n.category_id = a.id left join s_users as u on n.vendor_id = u.user_id left join s_vendors as v on u.user_id = v.user_id where u.status = '1' and n.service_type = 'instant' and n.status = '1' HAVING distance < 10 ORDER BY distance limit 4`

/**** store detail *****/
let getInstantServices = (criteria, callback) => {
    let conditions = "";
    //criteria.category_id ? conditions += `v.category_id = '${criteria.category_id}'` : true;
    conditions += `u.status = '1' and n.service_type = 'instant'`;

    dbConfig.getDB().query(`select DISTINCT a.id,a.name as category_name,a.description,a.category_image as image,a.status,a.added_on from s_users as u left join s_vendors as v on u.user_id = v.user_id left join s_inventory as n on u.user_id = n.vendor_id left join s_categories as a on n.category_id = a.id where ${conditions} and round(( 6371 * acos( cos( radians('${criteria.lat}') ) * cos( radians( v.lat ) ) * cos( radians( v.lng ) - radians('${criteria.lng}') ) + sin( radians('${criteria.lat}') ) * sin( radians( v.lat ) ) ) )) < 10 limit 4`, async function (err, res) {
        if (err) {
            callback(err, null)
        }
        else {
            //console.log()
           callback(null, res);
        }
    });
}

/**** Get Product Variants *****/
let getProductVariants = (criteria, callback) => {
    let conditions = "";
    criteria.item_id ? conditions += `i.id = '${criteria.item_id}'` : true;
    conditions += ` and i.status = '1'`;
    dbConfig.getDB().query(`select i.id as item_id,i.vendor_id,i.item_image,i.name,i.service_type,i.subscription_type,i.in_stock,i.eta,v.id as variant_id,v.unit_price,v.unit_qty,i.category_id,v.unit_type from s_inventory as i left join s_inventory_variants as v on i.id = v.item_id where ${conditions} order by v.id desc`, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res);
        }
    });
}

/**** subscription *****/
let subscription = (criteria, callback) => {
    let conditions = "";
    criteria.item_id ? conditions += `i.id = '${criteria.item_id}'` : true;
    conditions += ` and v.id = '${criteria.variant_id}'`;
    conditions += ` and i.status = '1'`;

    dbConfig.getDB().query(`select i.id as item_id,i.vendor_id,i.item_image,i.name,i.service_type,i.subscription_type,i.in_stock,i.eta,v.unit_price,v.unit_qty,v.unit_type,v.id as variant_id from s_inventory as i left join s_inventory_variants as v on i.id = v.item_id where ${conditions}`, function (err, res) {
        console.log(err)
        if (err) {
            callback(err, null)
        } else {
            callback(null, res);
        }
    });
}

/**** add subscription *****/
let addSubscription = (dataToSet, callback) => {
    dbConfig.getDB().query("insert into s_subscriptions set ? ", dataToSet, callback);
}

/**** add wallet history *****/
let addWalletHistory = (dataToSet, callback) => {
    dbConfig.getDB().query("insert into s_wallet_history set ? ", dataToSet, callback);
}

/**** Add to Cart *****/
let addToCart = (dataToSet, callback) => {
    dbConfig.getDB().query(`SELECT * FROM s_cart WHERE user_id = ${dataToSet.user_id}`, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            if (res.length > 0) {
                let cart_id = res[0]['id'];
                //console.log('cart_id++++++++++++++++++++++',cart_id)
                dbConfig.getDB().query(`SELECT * FROM s_cart_items WHERE cart_id = ${cart_id} AND item_id = ${dataToSet.item_id}  AND category_id = ${dataToSet.category_id} AND variant_id = ${dataToSet.variant_id} AND product_order_type='${dataToSet.product_order_type}'`, function (err1, res1) {
                    if (err1) {
                        callback(err1, null)
                    } else {
                        if (res1.length > 0) {
                            let cart_item_id = res1[0]['cart_item_id'];
                            let newQuantity = parseInt(res1[0]['quantity']) + parseInt(dataToSet.quantity);
                            let setData = "";
                            newQuantity ? setData += `quantity = '${dataToSet.quantity}'` : true;

                            let conditions = "";
                            cart_item_id ? conditions += `cart_item_id ='${cart_item_id}'` : true;
                            dbConfig.getDB().query(`UPDATE s_cart_items SET ${setData} where ${conditions} `, function (err5, res5) {
                                if (err5) {
                                    callback(err5, null)
                                } else {
                                    if (dataToSet.product_order_type == 'subscription') {

                                        let setData2 = "";
                                        newQuantity ? setData2 += `quantity = '${dataToSet.quantity}'` : true;

                                        let conditions2 = "";
                                        cart_item_id ? conditions2 += `item_id ='${dataToSet.item_id}'` : true;

                                        conditions2 += `and user_id ='${dataToSet.user_id}'`;
                                        conditions2 += `and subscription_type ='${dataToSet.sub_tab}'`;

                                        dbConfig.getDB().query(`UPDATE s_subscriptions SET ${setData2} where ${conditions2} `, callback);

                                    } else {
                                        callback(null, res5);
                                    }
                                }
                            });



                        } else {
                            dbConfig.getDB().query(`SELECT * FROM s_cart_items WHERE cart_id = ${cart_id} and product_order_type = '${dataToSet.product_order_type}' limit 1`, function (err2, res2) {
                                if (err2) {
                                    callback(err2, null)
                                } else {

                                    if (res2.length > 0 && res2[0]['vendor_id'] != dataToSet.vendor_id) {
                                        let obj = {
                                            res: '1'
                                        }
                                        callback(null, obj)

                                    } else {
                                        let setCartData = {
                                            quantity: dataToSet.quantity,
                                            item_id: dataToSet.item_id,
                                            category_id: dataToSet.category_id,
                                            price: dataToSet.price ? dataToSet.price : '0',
                                            variant_id: dataToSet.variant_id,
                                            cart_id: cart_id,
                                            vendor_id: dataToSet.vendor_id,
                                            product_order_type: dataToSet.product_order_type
                                        }
                                        dbConfig.getDB().query("insert into s_cart_items SET ? ", setCartData, callback);
                                    }
                                }
                            });


                        }
                    }
                });
            } else {

                let setData1 = {
                    user_id: dataToSet.user_id
                }
                dbConfig.getDB().query("insert into s_cart SET ? ", setData1, function (err, cart_latest) {
                    var cart_insert = {
                        quantity: dataToSet.quantity,
                        item_id: dataToSet.item_id,
                        category_id: dataToSet.category_id,
                        price: dataToSet.price,
                        cart_id: cart_latest.insertId,
                        variant_id: dataToSet.variant_id,
                        vendor_id: dataToSet.vendor_id,
                        product_order_type: dataToSet.product_order_type
                    }
                    dbConfig.getDB().query("insert into s_cart_items SET ? ", cart_insert, callback);
                });

            }
        }
    });

}

/*** Cart Data ***/
let get_cart = (criteria, callback) => {
    let tab = 'instant';
    if (criteria.tab && criteria.tab != 'instant') {
        tab = 'daily';
    }
    if (tab == 'instant') {
        dbConfig.getDB().query(`SELECT ci.*,i.name,i.description,v.unit_qty,ci.quantity as cart_quantity ,i.status,i.item_image,i.in_stock,v.unit_type, IFNULL(ROUND(v.unit_price,2),ROUND(i.base_price,2)) as unitprice FROM s_cart as c left join s_cart_items as ci on c.id = ci.cart_id left join s_inventory as i on i.id = ci.item_id left join s_inventory_variants as v on v.id = ci.variant_id WHERE c.user_id = ${criteria.user_id} and ci.product_order_type = 'normal'`, async function (err, res) {
            if (err) {
                callback(err, null)
            } else {
                let total = 0;
                let tax = 0;
                let shipping_charge = 0;
                let address = {};
                let total_amount = 0;
                let minimum_order = 0;
                let discount = 0;
                let disVal = 0;
                let discount_type,discount_value,coupon_type,min_order_value
                
                if (res && res.length > 0) {
                    res.forEach(element => {
                        element.totalProductPrice = parseFloat(element.unitprice) * parseInt(element.quantity);
                        total = total + parseFloat(element.totalProductPrice);
                    });

                    let coupan_detail;
                    if(criteria.coupon_code != '' && res && res.length > 0){ 
                    let vendor_id = res[0].vendor_id;
                    //console.log('vvvvvv------',vendor_id)
                    coupan_detail = await new Promise((resolve, reject) => {
                       
                        dbConfig.getDB().query(`SELECT discount_type,discount_value,min_order_value,coupon_code,coupon_type FROM s_promotions WHERE vendor_id = ${vendor_id} and coupon_code = '${criteria.coupon_code}' and status = '1' limit 1`, function (errc, resc) {
                            if (errc) {
                                resolve('')
                            } else {
                                if (resc && resc.length > 0) {
                                    resolve(resc)
                                } else {
                                    resolve('')
                                }
                            }
                        });
                    })
                }

                    let add = await new Promise((resolve, reject) => {
                        dbConfig.getDB().query(`SELECT * FROM s_user_address WHERE user_id = ${criteria.user_id} and status = '1' limit 1`, function (erra, resa) {
                            if (erra) {
                                resolve('')
                            } else {
                                if (resa && resa.length > 0) {
                                    resolve(resa)
                                } else {
                                    resolve('')
                                }
                            }
                        });
                    })

                    if (add.length == 0) {
                        add = await new Promise((resolve, reject) => {
                            dbConfig.getDB().query(`SELECT * FROM s_user_address WHERE user_id = ${criteria.user_id} order by address_id desc limit 1`, function (erra, resa) {
                                if (erra) {
                                    resolve('')
                                } else {
                                    if (resa && resa.length > 0) {
                                        resolve(resa)
                                    } else {
                                        resolve('')
                                    }
                                }
                            });
                        })
                    }

                    if (add && add.length > 0) {
                        address = add[0];
                        
                        let shipCharge = await new Promise((resolve, reject) => {
                            dbConfig.getDB().query(`SELECT a.base_delivery_charge , a.delivery_charge_per_km , a.minimum_order, a.base_delivery_distance, a.lng, a.lat FROM s_vendors AS a
                             WHERE user_id = ${res[0].vendor_id}`, function (errd, resd) {
                                if (errd) {
                                    resolve(errd)
                                } else {
                                    if (resd && resd.length > 0) {
                                        resolve(resd)
                                    } else {
                                        resolve(resd)
                                    }
                                }
                            });
                        })

                        
                        let distancData = await new Promise((resolve, reject) => {
                                request(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${shipCharge[0].lat},${shipCharge[0].lng}&destinations=${add[0].lat},${add[0].lng}&key=AIzaSyC3k63UyxqEz5Ma1KHbQ215QUZ83CtsYo8&sensor=false`, function (error, response, body) {
                                    // console.error('error:', error);
                                    // console.log('statusCode:', response && response.statusCode);
                                    console.log('body:', body);
                                    if (response && response.statusCode != '200') {
                                        resolve('0')
                                    } else {
                                        if (response && response.statusCode == '200') {
                                            resolve(JSON.parse(body))
                                        } else {
                                            resolve('0')
                                        }
                                    }
            
                                });
                            })
                        
                            
                        
                          disVal = distancData.rows[0].elements[0].distance.value ? distancData.rows[0].elements[0].distance.value/1000 : 0;
                        
                         shipCharge[0].distance_in_km = Math.round(disVal);

                        console.log(shipCharge[0].distance_in_km,'======', shipCharge[0].base_delivery_distance)

                        let distance = shipCharge[0].distance_in_km <= shipCharge[0].base_delivery_distance ? shipCharge[0].base_delivery_distance : parseFloat(shipCharge[0].distance_in_km) - parseFloat(shipCharge[0].base_delivery_distance);
                        
                        shipping_charge = (parseFloat(shipCharge[0].base_delivery_charge) + (parseFloat(distance) * parseFloat(shipCharge[0].delivery_charge_per_km)));

                        minimum_order = shipCharge[0].minimum_order;

                    }
                   
                if(coupan_detail && coupan_detail.length>0 && coupan_detail[0].min_order_value <= total && (coupan_detail[0].coupon_type == 'order' || coupan_detail[0].coupon_type == 'both')){
                    
                discount_type = coupan_detail[0].discount_type?coupan_detail[0].discount_type:'';
                discount_value = coupan_detail[0].discount_value?coupan_detail[0].discount_value:'';
                coupon_type = coupan_detail[0].coupon_type?coupan_detail[0].coupon_type:'';
                min_order_value = coupan_detail[0].min_order_value?coupan_detail[0].min_order_value:'';    

                        if(coupan_detail[0].discount_type == '0' ){
                           discount = coupan_detail[0].discount_value;
                        }else{
                           discount = total*(coupan_detail[0].discount_value/100);
                        }
                    }

                    tax = parseFloat(total) * 5 / 100;
                    total_amount = total + tax + parseFloat(shipping_charge) - discount;

                }

                

                let obj = {
                    res: res,
                    total: total,
                    tax: tax,
                    total_amount: total_amount,
                    address: address,
                    shipping_charge: shipping_charge,
                    minimum_order: minimum_order,
                    discount : discount,
                    discount_type : discount_type?discount_type:'',
                    discount_value : discount_value?discount_value:'',
                    coupon_type : coupon_type?coupon_type:'',
                    min_order_value : min_order_value?min_order_value:'',
                    distance: disVal
                }
                callback(null, obj)
            }
        });

    } else {
        console.log('criteria.sub_tab+++++++++++', criteria.sub_tab)
        let subtab = 'daily';
        if (criteria.sub_tab && criteria.sub_tab == 'one time') {
            subtab = 'one time';
        }
        else if (criteria.sub_tab && criteria.sub_tab == 'day') {
            subtab = 'day';
        }
        console.log('subtab+++++++++++++>', subtab)

        dbConfig.getDB().query(`SELECT ci.*,s.quantity as updated_quantity,i.name,i.description,v.unit_qty,ci.quantity as cart_quantity ,i.status,v.unit_type,i.item_image,i.in_stock, IFNULL(ROUND(v.unit_price,2),ROUND(i.base_price,2)) as unitprice FROM s_cart as c left join s_cart_items as ci on c.id = ci.cart_id left join s_inventory as i on i.id = ci.item_id left join s_inventory_variants as v on v.id = ci.variant_id left join s_subscriptions as s on s.item_id = ci.item_id WHERE c.user_id = ${criteria.user_id} and ci.product_order_type = 'subscription' and s.subscription_type = '${subtab}'`, async function (err, res) {
            if (err) {
                callback(err, null)
            } else {
                let total = 0;
                let tax = 0;
                let shipping_charge = 0;
                let address = {};
                let total_amount = 0;
                let minimum_order = 0;
                let discount = 0;
                let disVal = 0;
                let discount_type,discount_value,coupon_type,min_order_value
                if (res && res.length > 0) {
                    res.forEach(element => {
                        element.totalProductPrice = parseFloat(element.unitprice) * parseInt(element.updated_quantity);
                        total = total + parseFloat(element.totalProductPrice);
                    });

                    let coupan_detail;
                    if(criteria.coupon_code != '' && res && res.length > 0){ 
                    let vendor_id = res[0].vendor_id;
                    coupan_detail = await new Promise((resolve, reject) => {
                        dbConfig.getDB().query(`SELECT discount_type,discount_value,min_order_value,coupon_code,coupon_type FROM s_promotions WHERE vendor_id = ${vendor_id} and coupon_code = '${criteria.coupon_code}' and status = '1' limit 1`, function (errc, resc) {
                            if (errc) {
                                resolve('')
                            } else {
                                if (resc && resc.length > 0) {
                                    resolve(resc)
                                } else {
                                    resolve('')
                                }
                            }
                        });
                    })
                }

                    let add = await new Promise((resolve, reject) => {
                        dbConfig.getDB().query(`SELECT * FROM s_user_address WHERE user_id = ${criteria.user_id} order by address_id desc limit 1`, function (erra, resa) {
                            if (erra) {
                                resolve('')
                            } else {
                                if (resa && resa.length > 0) {
                                    resolve(resa)
                                } else {
                                    resolve('')
                                }
                            }
                        });
                    })

                    if (add.length == 0) {
                        add = await new Promise((resolve, reject) => {
                            dbConfig.getDB().query(`SELECT * FROM s_user_address WHERE user_id = ${criteria.user_id} order by address_id desc limit 1`, function (erra, resa) {
                                if (erra) {
                                    resolve('')
                                } else {
                                    if (resa && resa.length > 0) {
                                        resolve(resa)
                                    } else {
                                        resolve('')
                                    }
                                }
                            });
                        })
                    }

                    console.log('address+++++++++++>', add)
                    if (add && add.length > 0) {
                        address = add[0];

                        let shipCharge = await new Promise((resolve, reject) => {
                            dbConfig.getDB().query(`SELECT a.base_delivery_charge , a.delivery_charge_per_km , a.minimum_order, a.base_delivery_distance, a.lng, a.lat FROM s_vendors AS a
                             WHERE user_id = ${res[0].vendor_id}`, function (errd, resd) {
                                if (errd) {
                                    resolve(errd)
                                } else {
                                    if (resd && resd.length > 0) {
                                        resolve(resd)
                                    } else {
                                        resolve(resd)
                                    }
                                }
                            });
                        })

                        
                        let distancData = await new Promise((resolve, reject) => {
                                request(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${shipCharge[0].lat},${shipCharge[0].lng}&destinations=${add[0].lat},${add[0].lng}&key=AIzaSyC3k63UyxqEz5Ma1KHbQ215QUZ83CtsYo8&sensor=false`, function (error, response, body) {
                                    // console.error('error:', error);
                                    // console.log('statusCode:', response && response.statusCode);
                                    console.log('body:', body);
                                    if (response && response.statusCode != '200') {
                                        resolve('0')
                                    } else {
                                        if (response && response.statusCode == '200') {
                                            resolve(JSON.parse(body))
                                        } else {
                                            resolve('0')
                                        }
                                    }
            
                                });
                            })
                        
                            
                        
                         disVal = distancData.rows[0].elements[0].distance.value ? distancData.rows[0].elements[0].distance.value/1000 : 0;
                        
                         shipCharge[0].distance_in_km = Math.round(disVal);

                        let distance = shipCharge[0].distance_in_km <= shipCharge[0].base_delivery_distance ? shipCharge[0].base_delivery_distance : parseFloat(shipCharge[0].distance_in_km) - parseFloat(shipCharge[0].base_delivery_distance);

                        shipping_charge = (parseFloat(shipCharge[0].base_delivery_charge) + (parseFloat(distance) * parseFloat(shipCharge[0].delivery_charge_per_km)));

                        //shipping_charge = shipCharge[0].minimum_order<=total?shipCharge[0].base_delivery_charge:0;

                        minimum_order = shipCharge[0].minimum_order;

                    }

                    if(coupan_detail && coupan_detail.length>0 && coupan_detail[0].min_order_value <= total && (coupan_detail[0].coupon_type == 'subscription' || coupan_detail[0].coupon_type == 'both')){

                discount_type = coupan_detail[0].discount_type?coupan_detail[0].discount_type:'';
                discount_value = coupan_detail[0].discount_value?coupan_detail[0].discount_value:'';
                coupon_type = coupan_detail[0].coupon_type?coupan_detail[0].coupon_type:'';
                min_order_value = coupan_detail[0].min_order_value?coupan_detail[0].min_order_value:'';

                        if(coupan_detail[0].discount_type == '0' ){
                           discount = coupan_detail[0].discount_value;
                        }else{
                           discount = total*(coupan_detail[0].discount_value/100);
                        }
                    }

                    tax = parseFloat(total) * 5 / 100;
                    total_amount = total + tax + parseFloat(shipping_charge) - discount;

                    // tax = parseFloat(total) * 5 / 100;
                    // total_amount = total + tax + parseFloat(shipping_charge);
                }
                let obj = {
                    res: res,
                    total: total,
                    tax: tax,
                    total_amount: total_amount,
                    address: address,
                    shipping_charge: shipping_charge,
                    minimum_order: minimum_order,
                    discount : discount,
                    discount_type : discount_type?discount_type:'',
                    discount_value : discount_value?discount_value:'',
                    coupon_type : coupon_type?coupon_type:'',
                    min_order_value : min_order_value?min_order_value:'',
                    distance: disVal
                }
                callback(null, obj)
            }
        });

    }

}

/*** Remove Item From Cart ***/
let removeFromCart = (criteria, callback) => {
    dbConfig.getDB().query(`DELETE FROM s_cart_items WHERE cart_item_id=${criteria.cart_item_id}`, callback);
}

/*** Get Cart Count ***/
let get_cart_count = (dataToSet, callback) => {
    dbConfig.getDB().query(`SELECT * FROM s_cart WHERE user_id = ${dataToSet.user_id}`, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            if (res.length > 0) {
                let cart_id = res[0]['id'];
                let conditions = "";
                conditions += `cart_id ='${cart_id}'`;
                dbConfig.getDB().query(`SELECT COUNT(*) as count,SUM(price*quantity) as price from s_cart_items where ${conditions} `, callback);
            } else {
                var result = [];
                var res = {}
                res.count = 0;
                res.price = 0;
                result.push(res);
                callback(err, result)
            }
        }
    });
}

/*** Get Notification Count ***/
let getNotificationCount = (criteria, callback) => {
    dbConfig.getDB().query(`select COUNT(*) as count from s_notifications where receiver_id = '${criteria.user_id}' and read_status = '0'`, callback);
}

/** place order  */
let placeOrder = (dataToSet, callback) => {
    dbConfig.getDB().query(`SELECT * FROM s_cart WHERE user_id = ${dataToSet.user_id}`, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            if (res.length > 0) {
                let tab = 'normal';
                if (dataToSet.order_type && dataToSet.order_type != 'normal') {
                    tab = 'subscription';
                }
                let cart_id = res[0]['id'];
                if (tab == 'normal') {

                    dbConfig.getDB().query(`SELECT c.*,IFNULL(ROUND(v.unit_price,2),ROUND(i.base_price,2)) as price FROM s_cart_items as c left join s_inventory_variants as v on v.id = c.variant_id left join s_inventory as i on i.id = c.item_id WHERE c.cart_id = ${cart_id} and c.product_order_type = '${tab}'`, function (err1, res1) {
                       if (err1) {
                            callback(err1, null)
                        } else {
                            if (res1.length > 0) {
                                var data1 = {
                                    order_unique_id: dataToSet.order_unique_id,
                                    payment_mode: dataToSet.payment_mode,
                                    order_status: 'pending',
                                    order_price: dataToSet.order_price,
                                    address_id: dataToSet.address_id ? dataToSet.address_id : '0',
                                    subscription_type: dataToSet.sub_tab?dataToSet.sub_tab:'',
                                    vendor_id: dataToSet.vendor_id,
                                    order_type: dataToSet.order_type,
                                    address: dataToSet.address,
                                    lat: dataToSet.lat,
                                    lng: dataToSet.lng,
                                    user_id: dataToSet.user_id,
                                    currency: 'Rs',
                                    address_type: dataToSet.address_type,
                                    delivery_charge: dataToSet.delivery_charge ? dataToSet.delivery_charge : 0,
                                    discount: dataToSet.discount ? dataToSet.discount : '0',
                                    coupon_code: dataToSet.coupon_code ? dataToSet.coupon_code : '',
                                    total_item_price: dataToSet.total_item_price ? dataToSet.total_item_price : 0,
                    bnaktxn_id: dataToSet.bnaktxn_id ? dataToSet.bnaktxn_id : '',
                    checksum_hash: dataToSet.checksum_hash ? dataToSet.checksum_hash : '',
                    paytm_order_id: dataToSet.paytm_order_id ? dataToSet.paytm_order_id : '',
                    response_paytm:dataToSet.response_paytm ? dataToSet.response_paytm : '',
                            
                            discount_value: dataToSet.discount_value ? dataToSet.discount_value : '0',
                        discount_type: dataToSet.discount_type ? dataToSet.discount_type : '',
                            coupon_type: dataToSet.coupon_type ? dataToSet.coupon_type : '',
                            min_order_value: dataToSet.min_order_value ? dataToSet.min_order_value : '0',
                            tax: dataToSet.tax ? dataToSet.tax : 0
                                }

                                dbConfig.getDB().query("insert into s_orders set ? ", data1, function (err2, orderId) {
                                    
                                    let order_latest_id = orderId.insertId
                                    for (const [key, value] of Object.entries(res1)) {
                                        var order_detail = {
                                            order_id: order_latest_id,
                                            item_id: res1[key].item_id,
                                            variant_id: res1[key].variant_id,
                                            quantity: res1[key].quantity,
                                            currency: 'Rs',
                                            price: res1[key].price ? res1[key].price : '0.00'
                                        }

                                        dbConfig.getDB().query("insert into s_order_details set ? ", order_detail, function (err3, detail_res) {
                                            console.log('2323223++++++++', err3)
                                            let conditions = "";
                                            conditions += `cart_item_id ='${res1[key].cart_item_id}'`;
                                            dbConfig.getDB().query(`DELETE from s_cart_items where ${conditions} `, null);
                                            

                                            dbConfig.getDB().query(`SELECT c.order_unique_id,ci.id,ci.order_id,ci.added_on,ci.item_id,ci.variant_id,ci.quantity,IFNULL(i.name,'') as variant_name,ci.currency,ci.price as price,i.name FROM s_orders as c inner join s_order_details as ci on c.id = ci.order_id left join s_inventory_variants as v on v.id = ci.variant_id inner join s_inventory as i on i.id = ci.item_id WHERE c.id = ${order_latest_id}`, callback);
                                        });

                                    }
                                });


                            }
                        }
                    });

                } else {

                    let subtab = 'daily';

                    if (dataToSet.sub_tab && dataToSet.sub_tab == 'one time') {
                        subtab = 'one time';
                    }
                    else if (dataToSet.sub_tab && dataToSet.sub_tab == 'day') {
                        subtab = 'day';
                    }
                    
                    dbConfig.getDB().query(`SELECT c.*,s.quantity as update_quantity,IFNULL(ROUND(v.unit_price,2),ROUND(i.base_price,2)) as price FROM s_cart_items as c left join s_inventory_variants as v on v.id = c.variant_id left join s_inventory as i on i.id = c.item_id left join s_subscriptions as s on s.item_id = c.item_id WHERE c.cart_id = '${cart_id}' and c.product_order_type = '${tab}' and s.subscription_type = '${subtab}'`, function (err1, res1) {
                        console.log('model_cart_error++++++++++>', err1)
                        if (err1) {
                            callback(err1, null)
                        } else {
                            if (res1.length > 0) {
                             
                                var data1 = {
                                    order_unique_id: dataToSet.order_unique_id,
                                    payment_mode: dataToSet.payment_mode,
                                    order_status: 'pending',
                                    order_price: dataToSet.order_price,
                                    delivery_charge: dataToSet.delivery_charge ? dataToSet.delivery_charge : 0,
                                address_id: dataToSet.address_id ? dataToSet.address_id : '0',
                                    vendor_id: dataToSet.vendor_id,
                                    order_type: dataToSet.order_type,
                                    subscription_type: dataToSet.sub_tab?dataToSet.sub_tab:'',
                                    total_item_price: dataToSet.total_item_price ? dataToSet.total_item_price : 0,
                                    address: dataToSet.address,

                                    lat: dataToSet.lat,
                                    lng: dataToSet.lng,
                                    user_id: dataToSet.user_id,
                                    currency: 'Rs',
                                    address_type: dataToSet.address_type,

                                    discount: dataToSet.discount ? dataToSet.discount : '0',
                                    coupon_code: dataToSet.coupon_code ? dataToSet.coupon_code : '',

                    bnaktxn_id: dataToSet.bnaktxn_id ? dataToSet.bnaktxn_id : '',
                    checksum_hash: dataToSet.checksum_hash ? dataToSet.checksum_hash : '',
                    paytm_order_id: dataToSet.paytm_order_id ? dataToSet.paytm_order_id : '',
                    response_paytm:dataToSet.response_paytm ? dataToSet.response_paytm : '',
                            
                            discount_value: dataToSet.discount_value ? dataToSet.discount_value : '0',
                        discount_type: dataToSet.discount_type ? dataToSet.discount_type : '',
                            coupon_type: dataToSet.coupon_type ? dataToSet.coupon_type : '',
                            min_order_value: dataToSet.min_order_value ? dataToSet.min_order_value : '0',
                            tax: dataToSet.tax ? dataToSet.tax : 0
                                }

                                dbConfig.getDB().query("insert into s_orders set ? ", data1, function (err2, orderId) {
                                    let order_latest_id = orderId.insertId
                                    for (const [key, value] of Object.entries(res1)) {
                                        var order_detail = {
                                            order_id: order_latest_id,
                                            item_id: res1[key].item_id,
                                            variant_id: res1[key].variant_id,
                                            quantity: res1[key].update_quantity,
                                            currency: 'Rs',
                                            price: res1[key].price ? res1[key].price : '0.00'
                                        }

                                        dbConfig.getDB().query("insert into s_order_details set ? ", order_detail, function (err3, detail_res) {
                                            let conditions = "";
                                            conditions += `cart_item_id ='${res1[key].cart_item_id}'`;
                                            dbConfig.getDB().query(`DELETE from s_cart_items where ${conditions} `, null);
                                            

                                            dbConfig.getDB().query(`SELECT c.order_unique_id,ci.id,ci.order_id,ci.added_on,ci.item_id,ci.variant_id,ci.quantity,IFNULL(i.name,'') as variant_name,ci.currency,ci.price as price,i.name FROM s_orders as c inner join s_order_details as ci on c.id = ci.order_id left join s_inventory_variants as v on v.id = ci.variant_id inner join s_inventory as i on i.id = ci.item_id WHERE c.id = '${order_latest_id}'`, callback);
                                        });

                                    }
                                });


                            }
                        }
                    });



                }

             }
        }
    });
}

/**  current orders data */

let getOrders = (criteria, callback) => {
    
      if(criteria.order_type == 'normal'){

        dbConfig.getDB().query(`SELECT o.id,o.order_unique_id,o.vendor_id,o.address_id,o.order_type,o.currency,o.order_price,o.order_status,o.payment_mode,o.added_on as order_date,(SELECT COUNT(id) FROM s_order_details as od where od.order_id = o.id) as total_items ,(SELECT u.profile_pic FROM s_users as u where u.user_id = o.vendor_id) as image,(SELECT v.store_name FROM s_vendors as v where v.user_id = o.vendor_id) as store_name FROM s_orders as o WHERE o.user_id =  ${criteria.user_id} and o.order_type = '${criteria.order_type}' ORDER BY o.id DESC`, callback)

      }else{

        let tab = 'daily';

        if (criteria.tab && criteria.tab == 'one time') {
            tab = 'one time';
        }
        else if (criteria.tab && criteria.tab == 'day') {
            tab = 'day';
        }

        dbConfig.getDB().query(`SELECT o.id,o.order_unique_id,o.vendor_id,o.address_id,o.order_type,o.currency,o.order_price,o.order_status,o.payment_mode,o.added_on as order_date,(SELECT COUNT(id) FROM s_order_details as od where od.order_id = o.id) as total_items ,(SELECT u.profile_pic FROM s_users as u where u.user_id = o.vendor_id) as image,(SELECT v.store_name FROM s_vendors as v where v.user_id = o.vendor_id) as store_name FROM s_orders as o WHERE o.user_id =  ${criteria.user_id} and o.order_type = '${criteria.order_type}' and o.subscription_type = '${tab}' ORDER BY o.id DESC`, callback) 

      }
    
}

//===================  get Address ====================//

let getAddressData = (criteria, callback) => {
    
    let conditions = "";

    criteria.address_id ? conditions += `ua.address_id = '${criteria.address_id}'` : true;
    
    dbConfig.getDB().query(`Select ua.* from s_user_address as ua where ${conditions}`, callback);
    
}

//===================  order data ====================//

let get_order_details = (criteria, callback) => {
    dbConfig.getDB().query(`SELECT o.id as order_id,o.order_unique_id,i.id,od.quantity,i.name as item_name,v.id as variant_id,od.currency,od.quantity,od.price as unit_price,o.added_on FROM s_orders as o LEFT join s_order_details as od on o.id = od.order_id left join s_inventory as i on i.id = od.item_id left join s_inventory_variants as v on v.id = od.variant_id WHERE o.id = ${criteria.order_id}`, callback)

}

let get_order_data = (criteria, callback) => {
    dbConfig.getDB().query(`SELECT o.id,o.order_unique_id,o.total_item_price,o.vendor_id,o.address_id,o.order_type,o.currency,o.order_price,o.order_status,o.payment_mode,o.added_on as order_date,o.delivery_charge,o.discount,o.coupon_code,o.bnaktxn_id,o.paytm_order_id,o.tax,o.discount_type,(SELECT COUNT(id) FROM s_order_details as od where od.order_id = o.id) as total_items ,(SELECT u.profile_pic FROM s_users as u where u.user_id = o.vendor_id) as image,(SELECT v.store_name FROM s_vendors as v where v.user_id = o.vendor_id) as store_name FROM s_orders as o WHERE o.id = ${criteria.order_id}`, callback)
}

/*** Get Cart Count ***/
let clearCart = (dataToSet, callback) => {
    dbConfig.getDB().query(`SELECT * FROM s_cart WHERE user_id = ${dataToSet.user_id}`, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            if (res.length > 0) {
                let cart_id = res[0]['id'];
                let conditions = "";
                conditions += `cart_id ='${cart_id}' and product_order_type = '${dataToSet.service_type}'`;
                dbConfig.getDB().query(`DELETE FROM s_cart_items WHERE ${conditions} `, callback);
            } else {
                var result = [];
                var res = {}
                res.count = 0;
                res.price = 0;
                result.push(res);
                callback(err, result)
            }
        }
    });
}

/*** To check is itemblocked or not */

let is_item_blocked = (dataToSet, callback) => {
    dbConfig.getDB().query(`SELECT * FROM s_cart WHERE user_id = ${dataToSet.user_id}`, function (err, res) {
        if (err) {
            //console.log(err)
            callback(err, null)
        } else {
            if (res.length > 0) {
                let tab = 'instant';
                if (dataToSet.order_type && dataToSet.order_type != 'normal') {
                    tab = 'daily';
                }
                let cart_id = res[0]['id'];
                dbConfig.getDB().query(`SELECT COUNT(c.item_id) as count FROM s_cart_items as c LEFT JOIN s_inventory as i on i.id = c.item_id WHERE c.cart_id = ${cart_id} and i.status != '1' and i.service_type = '${tab}' `, function (err1, res1) {
                    if (err1) {
                        callback(err1, null)
                    } else {
                        callback(null, res1)
                    }
                });
            }
        }
    });
}

module.exports = {
    createUser: createUser,
    createUserInfo: createUserInfo,
    getUsers: getUsers,
    getUserData: getUserData,
    getUsersLogin: getUsersLogin,
    updateDeviceToken: updateDeviceToken,
    updateProfile: updateProfile,
    addAddress: addAddress,
    getAddresses: getAddresses,
    updateAddress: updateAddress,
    getCategory: getCategory,
    getStoreDetail: getStoreDetail,
    getAllStore: getAllStore,
    getProductVariants: getProductVariants,
    subscription: subscription,
    addSubscription: addSubscription,
    addToCart: addToCart,
    get_cart: get_cart,
    removeFromCart: removeFromCart,
    get_cart_count: get_cart_count,
    getNotificationCount: getNotificationCount,
    placeOrder: placeOrder,
    clearCart: clearCart,
    is_item_blocked: is_item_blocked,
    changeAddress: changeAddress,
    getBannerTop: getBannerTop,
    getBannerMidTop: getBannerMidTop,
    getBannerMidBottom: getBannerMidBottom,
    getBannerBottom: getBannerBottom,
    getDailyServices: getDailyServices,
    getCategoryData: getCategoryData,
    getUsersDetails: getUsersDetails,
    getInstantServices: getInstantServices,
    getCustomerRecentAddresses: getCustomerRecentAddresses,
    getMobileUsers: getMobileUsers,
    checkCouponCode: checkCouponCode,
    getOrders: getOrders,
    getAddressData: getAddressData,
    get_order_details: get_order_details,
    get_order_data: get_order_data,
    addNotification: addNotification,
    addWalletAmount: addWalletAmount,
    addWalletHistory: addWalletHistory,
    getWalletHistory: getWalletHistory
}