/*
 * @Author: Tripti Bhardwaj
 * @Date: April 5, 2021
 */


let async = require('async'),
    jwt = require('jsonwebtoken');
let dbConfig = require("../Utilities/dbConfig");

let util = require('../Utilities/util'),
    config = require('../Utilities/Config'),
    customerDAO = require('../DAO/customerDAO');
const request = require('request');
let multiparty = require('multiparty');
//let dbConfig = require("../PaytmChecksum");
const https = require('https');
const { response } = require('express');




// let FCM = require('fcm-node');
// // let driverserverKey = 'AAAA_1psqb0:APA91bH1bHT_GHx_M4Qn97-vRDAxgdVf4NqknmwciHXRRU64W2BGwlU0UjpX5RcPDuZIJxZIEDcBIl5-xyXM2SUIzP35gRB_29GIMBLn9Jl1JPQkCaDDDNFD7HZow74VuPh7qXBkBzrU'; //put your server key here
// let driverserverKey = 'AAAABOhrkPQ:APA91bEXkat1xH4M04jKGPHOBZePJQ83n4nD3mSHQXQY8uRbckT5oLzCj4LafFgg7R1LSzvH_s97eoMHw0OyJtV-6xvhn9OLxdLhWOpJm38OAWzR3YSLjsclQ0dKO1Hny4J_lS8P-25t'; //put your server key here
// let driverfcm = new FCM(driverserverKey);


/****** Mobile Validation API *****/
let checkMobile = (data, cb) => {
    if (!data.mobile_no) {
        cb({ "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
        return;
    }
    let UserData = {
        mobile_no: data.mobile_no,
        user_type: 'customer'
    }
    customerDAO.getMobileUsers(UserData, (err, dbData) => {
        console.log(err, dbData)
        if (err) {
            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR });
            return;
        }
        if (dbData && dbData.length) {
            if(dbData[0].user_type == 'customer'){
            cb({ "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.MOBILE_EXIST });
            return;
            }else{
                cb({ "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": "This number is already registered with another servicekart platform" });
                return;
            }
        } else {
            cb({ "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": util.statusMessage.NEW_MOBILE });
            return;
        }
    });
}

/****** Email Validation API *****/
let checkEmail = (data, cb) => {
    if (!data.email_id) {
        cb({ "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
        return;
    }
    let UserData = {
        email_id: data.email_id,
        user_type: 'customer'
    }
    customerDAO.getUsers(UserData, (err, dbData) => {
        if (err) {
            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR });
            return;
        }
        console.log('chk mail data-----', dbData);
        if (dbData && dbData.length > 0) {
            cb({ "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": util.statusMessage.EMAIL_EXIST });
            return;
        } else {
            cb({ "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.NEW_EMAIL });
            return;
        }
    });
}

/****** Social Account Check(old or new) API *****/
let socialCheck = (data, cb) => {
    if (!data.social_id || !data.account_type) {
        cb({ "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
        return;
    }
    let UserData = {
        social_id: data.social_id,
        account_type: data.account_type,
        user_type: 'customer'
    }
    console.log(UserData)
    customerDAO.getUsers(UserData, (err, dbData) => {
        console.log('err+++++++++___>', err)
        if (err) {
            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR });
            return;
        }
        if (dbData && dbData.length) {
            const token = jwt.sign({ id: dbData[0].user_id }, 'SERVICE_KART', {})
            dbData[0].access_token = token;
            cb({ "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.OLD_USER, "result": dbData[0] });
            return;
        } else {
            cb({ "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.NEW_USER });
            return;
        }
    });
}

/******* signup API *******/
let signup = (data, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {

            if (!data.first_name || !data.last_name || !data.mobile_no || !data.date_of_birth || !data.gender || !data.email_id || !data.country_code || !data.account_type) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            if (data.account_type && (data.account_type != 'normal') && !data.social_id) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            let criteria1 = {
                mobile_no: data.mobile_no,
                user_type: 'customer'
            }


            //Find the Mobile number
            customerDAO.getUsers(criteria1, (err, dbData1) => {
                console.log('err------------------->', err)
                if (err) {
                    cb(null, {
                        "statusCode": util.statusCode.INTERNAL_SERVER_ERROR,
                        "statusMessage": util.statusMessage.DB_ERROR
                    })
                    return;
                }
                if (dbData1 && dbData1.length) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": util.statusMessage.MOBILE_EXIST });
                    return;
                } else {
                    let criteria2 = {
                        email_id: data.email_id,
                        user_type: 'customer'
                    }
                    //Find the Email
                    customerDAO.getUsers(criteria2, (err, dbData2) => {
                        if (err) {
                            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                            return;
                        }
                        if (dbData2 && dbData2.length) {
                            cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": util.statusMessage.EMAIL_EXIST });
                            return;
                        } else {

                            let is_email_verified = '0';
                            if (data.account_type == 'fb' || data.account_type == 'google') {
                                is_email_verified = '1';
                            }

                            if (data.account_type == 'fb' && data.email_id == '') {
                                data.email_id = data.social_id + '@servicecart.co.in';
                            }
                            let vendorData = {
                                "first_name": data.first_name ? data.first_name : '',
                                "last_name": data.last_name ? data.last_name : '',
                                "email_id": data.email_id ? data.email_id : '',
                                "country_code": data.country_code ? data.country_code : '',
                                "mobile_no": data.mobile_no ? data.mobile_no : '',
                                "profile_pic": data.profile_pic ? data.profile_pic : '',
                                "gender": data.gender ? data.gender : '',
                                "date_of_birth": data.date_of_birth ? data.date_of_birth : '',
                                "password": data.password ? util.encryptData(data.password) : '',
                                "account_type": data.account_type ? data.account_type : 'normal',
                                "social_id": data.social_id ? data.social_id : '',
                                "is_email_verified": is_email_verified,
                                "device_token": '',
                                "user_type": 'customer',
                                "status": "1"
                            }


                            customerDAO.createUser(vendorData, (err, dbData) => {
                                if (err) {
                                    console.log(err)

                                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR });
                                    return;
                                } else {
                                    let criteria = {
                                        user_id: dbData.insertId
                                    }
                                    customerDAO.getUsers(criteria, (err, dbData) => {
                                        if (err) {
                                            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                                            return;
                                        }
                                        if (dbData && dbData.length) {

                                            const token = jwt.sign({ id: dbData[0].user_id }, 'SERVICE_KART', {})
                                            dbData[0].access_token = token;
                                            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.USER_ADDED, "result": dbData[0] });

                                        }
                                    });
                                }
                            });
                        }
                    });

                }
            });
        }
    },
        (err, response) => {
            cb(response.checkUserExistsinDB);
        })
}

/******* signup API for web *******/
let signupWeb = (data, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {

            let form = new multiparty.Form({ autoFiles: true, maxFilesSize: 10832325 });
            form.parse(data, async function (err, fields, files) {
                console.log('fields=============>', fields, files)
                let profile_pic = '';
                if (files) {
                    let add = await new Promise((resolve, reject) => {
                        util.scart_Multi_image_upload(files, (err12, result12) => {
                            if (err12) {
                                resolve('')
                            } else {
                                resolve(result12[0])
                            }
                        })
                    });
                    profile_pic = add;
                }

                console.log('+++++++++++++++++++++++++++>', profile_pic)
                if (!fields.first_name || !fields.last_name || !fields.mobile_no || !fields.date_of_birth || !fields.gender || !fields.email_id || !fields.country_code || !fields.account_type) {
                    cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                    return;
                }
                if (fields.account_type && (fields.account_type != 'normal') && !fields.social_id) {
                    cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                    return;
                }

                let criteria1 = {
                    mobile_no: fields.mobile_no,
                    user_type: 'customer'
                }


                //Find the Mobile number
                customerDAO.getUsers(criteria1, (err, dbData1) => {
                    if (err) {
                        cb(null, {
                            "statusCode": util.statusCode.INTERNAL_SERVER_ERROR,
                            "statusMessage": util.statusMessage.DB_ERROR
                        })
                        return;
                    }
                    if (dbData1 && dbData1.length) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": util.statusMessage.MOBILE_EXIST });
                        return;
                    } else {
                        let criteria2 = {
                            email_id: fields.email_id,
                            user_type: 'customer'
                        }
                        //Find the Email
                        customerDAO.getUsers(criteria2, (err, dbData2) => {
                            if (err) {
                                cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                                return;
                            }
                            if (dbData2 && dbData2.length) {
                                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": util.statusMessage.EMAIL_EXIST });
                                return;
                            } else {

                                let is_email_verified = '0';
                                if (fields.account_type == 'fb' || fields.account_type == 'google') {
                                    is_email_verified = '1';
                                }

                                let vendorData = {
                                    "first_name": fields.first_name ? fields.first_name : '',
                                    "last_name": fields.last_name ? fields.last_name : '',
                                    "email_id": fields.email_id ? fields.email_id : '',
                                    "country_code": fields.country_code ? fields.country_code : '',
                                    "mobile_no": fields.mobile_no ? fields.mobile_no : '',
                                    "profile_pic": profile_pic,
                                    "gender": fields.gender ? fields.gender : '',
                                    "date_of_birth": fields.date_of_birth ? fields.date_of_birth : '',
                                    "password": fields.password ? util.encryptData(fields.password) : '',
                                    "account_type": fields.account_type ? fields.account_type : 'normal',
                                    "social_id": fields.social_id ? fields.social_id : '',
                                    "is_email_verified": is_email_verified,
                                    "device_token": '',
                                    "user_type": 'customer',
                                    "status": "1"
                                }


                                customerDAO.createUser(vendorData, (err, dbData) => {
                                    if (err) {
                                        console.log(err)

                                        cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR });
                                        return;
                                    } else {
                                        let criteria = {
                                            user_id: dbData.insertId
                                        }
                                        customerDAO.getUsers(criteria, (err, dbData) => {
                                            if (err) {
                                                cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                                                return;
                                            }
                                            if (dbData && dbData.length) {

                                                const token = jwt.sign({ id: dbData[0].user_id }, 'SERVICE_KART', {})
                                                dbData[0].access_token = token;
                                                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.USER_ADDED, "result": dbData[0] });

                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });



            })
        }
    },
        (err, response) => {
            cb(response.checkUserExistsinDB);
        })
}

/*  Login API */
let login = (data, callback) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.mobile_no) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            let criteria = {
                mobile_no: data.mobile_no,
                user_type: 'customer'
            }
            customerDAO.getUsersLogin(criteria, (err, dbData) => {
                console.log(dbData, err)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                }
                if (dbData && dbData.length) {
                    const token = jwt.sign({ id: dbData[0].user_id }, 'SERVICE_KART', {})
                    dbData[0].token = token
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.LOGIN_SUCCESS, "result": dbData[0] });
                } else {
                    cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.INCORRECT_CREDENTIALS });
                }

            });
        }
    }, (err, response) => {
        callback(response.checkUserExistsinDB);
    })
}

// update device token
let updateDeviceToken = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.device_token && !data.device_type) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING, "result": "" })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let criteria = {
                user_id: userId
            }
            customerDAO.getUsers(criteria, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": util.statusMessage.DB_ERROR, "result": "" });
                    return;
                }
                if (dbData && dbData.length == 0) {
                    cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.INCORRECT_USER, "result": "" });
                    return;
                } else {
                    let dataToSet = {
                        device_token: data.device_token ? data.device_token : '',
                        device_type: data.device_type
                    }
                    customerDAO.updateDeviceToken(criteria, dataToSet, (err, updateData) => {
                        if (err) {
                            cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": "" })
                        }

                        customerDAO.getUserData(criteria, (err, dbData) => {
                            if (err) {
                                cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null })
                                return;
                            }
                            const token = jwt.sign({ id: dbData[0].user_id }, 'SERVICE_KART', {})
                            dbData[0].token = token
                            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Updated Successfully", "result": dataToSet });
                        });
                    });
                }

            });
        }

    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

/************ Update Profile ***********/
let updateProfile = (data, headers, cb) => {

    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.first_name || !data.last_name || !data.mobile_no || !data.date_of_birth || !data.gender || !data.email_id || !data.country_code || !data.account_type) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            if (data.account_type && (data.account_type != 'normal') && !data.social_id) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token

            })
            let criteria = {
                user_id: userId
            }

            let is_email_verified = '0';
            if (data.account_type == 'fb' || data.account_type == 'google') {
                is_email_verified = '1';
            }

            let dataToSet = {
                "first_name": data.first_name ? data.first_name : '',
                "last_name": data.last_name ? data.last_name : '',
                "email_id": data.email_id ? data.email_id : '',
                "country_code": data.country_code ? data.country_code : '',
                "mobile_no": data.mobile_no ? data.mobile_no : '',
                "profile_pic": data.profile_pic ? data.profile_pic : '',
                "gender": data.gender ? data.gender : '',
                "date_of_birth": data.date_of_birth ? data.date_of_birth : '',
                "password": data.password ? util.encryptData(data.password) : '',
                "account_type": data.account_type ? data.account_type : 'normal',
                "social_id": data.social_id ? data.social_id : '',
                "is_email_verified": is_email_verified,
                "device_token": '',
                "user_type": 'customer',
                "status": "1"
            }

            customerDAO.updateProfile(criteria, dataToSet, (err, updateData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                } else {
                    customerDAO.getUserData(criteria, (err, dbData) => {
                        if (err) {
                            cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                            return;
                        }
                        const token = jwt.sign({ id: dbData[0].user_id }, 'SERVICE_KART', {})
                        dbData[0].token = token
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.USER_UPDATED, "result": dbData[0] });
                    });
                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}


/************ Add Address ***********/
let addAddress = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.address_type || !data.house_no || !data.lat || !data.lng || !data.pincode) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token

            })
            let criteria = {
                user_id: userId
            }

            let dataToSet = {
                "name": data.name ? data.name : '',
                "address": data.address ? data.address : '',
                "address_type": data.address_type ? data.address_type : '',
                "landmark": data.landmark ? data.landmark : '',
                "house_no": data.house_no ? data.house_no : '',
                "city": data.city ? data.city : '',
                "pincode": data.pincode ? data.pincode : '',
                "user_id": userId,
                "lat": data.lat ? data.lat : '',
                "lng": data.lng ? data.lng : '',
                "pincode" : data.pincode ? data.pincode : ''
            }

            customerDAO.addAddress(dataToSet, (err, updateData) => {
                console.log('err++++++++++++++>', err)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                } else {

                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Address added successfully" });

                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}


/****** Get Profile API *****/
let getDetails = (data, headers, cb) => {
    var userId
    util.jwtDecode(headers.accesstoken, (err, token) => {
        userId = token

    })
    let UserData = {
        user_id: userId
    }
    customerDAO.getUserData(UserData, (err, dbData) => {
        if (err) {
            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": "" });
            return;
        }
        if (dbData && dbData.length) {
            const token = jwt.sign({ id: dbData[0].user_id }, 'SERVICE_KART', {})
            dbData[0].token = token
            cb({ "statusCode": util.statusCode.OK, "statusMessage": "Profile Data", "result": dbData });
            return;
        } else {
            cb({ "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": "User Not Exist", "result": "" });
            return;
        }
    });
}

/****** Get Addresses API *****/
let getAddresses = (data, headers, cb) => {
    var userId
    util.jwtDecode(headers.accesstoken, (err, token) => {
        userId = token
    })

    let UserData = {
        user_id: userId
    }
    customerDAO.getAddresses(UserData, (err, dbData) => {
        if (err) {
            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": [] });
            return;
        }
        if (dbData && dbData.length) {
            cb({ "statusCode": util.statusCode.OK, "statusMessage": "Got address list Successfully", "result": dbData });
            return;
        } else {
            cb({ "statusCode": util.statusCode.OK, "statusMessage": "No Data Found", "result": [] });
            return;
        }
    });
}

/****** Get Addresses API *****/
let getCustomerRecentAddresses = (data, headers, cb) => {
    var userId
    util.jwtDecode(headers.accesstoken, (err, token) => {
        userId = token

    })
    let UserData = {
        user_id: userId
    }
    customerDAO.getCustomerRecentAddresses(UserData, (err, dbData) => {
        if (err) {
            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": [] });
            return;
        }
        if (dbData && dbData.length) {
            cb({ "statusCode": util.statusCode.OK, "statusMessage": "Got recent address list Successfully", "result": dbData });
            return;
        } else {
            cb({ "statusCode": util.statusCode.OK, "statusMessage": "No Data Found", "result": [] });
            return;
        }
    });
}

/****** Get Addresses API *****/
let getCategory = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.lat || !data.lng || !data.service_type) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

    var userId
    util.jwtDecode(headers.accesstoken, (err, token) => {
        userId = token
    })

    let UserData = {
        user_id: userId
    }

    let criteria = {
        user_id: userId,
        lat: data.lat?data.lat:0,
        lng: data.lng?data.lng:0,
        service_type: data.service_type?data.service_type:'daily',
    }

    customerDAO.getCategory(criteria, (err, dbData) => {
        if (err) {
            cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": [] });
            return;
        }
        if (dbData && dbData.length) {
            console.log('yha')
            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Got category list Successfully", "result": dbData });
            return;
        } else {
            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "No Data Found", "result": [] });
            return;
        }
    });
   
}
}, (err, response) => {
    cb(response.checkUserExistsinDB);
})

}

/************ Delete Address ***********/
let deleteAddress = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.address_id) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token

            })

            let criteria = {
                user_id: userId,
            }

            let compData = {
                "address_id": data.address_id
            }

            let dataToSet = {
                "is_deleted": "1"
            }

            customerDAO.updateAddress(dataToSet, criteria, compData, (err, updateData) => {
                console.log(err)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                } else {

                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Address Deleted successfully" });

                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}


/************ Update Address ***********/
let updateAddress = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.address_id || !data.address_type || !data.house_no || !data.lat || !data.lng || !data.pincode) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token

            })

            let compData = {
                "address_id": data.address_id
            }

            let criteria = {
                user_id: userId
            }

            let dataToSet = {
                "name": data.name ? data.name : '',
                "address": data.address ? data.address : '',
                "address_type": data.address_type ? data.address_type : '',
                "landmark": data.landmark ? data.landmark : '',
                "house_no": data.house_no ? data.house_no : '',
                "lat": data.lat ? data.lat : '',
                "lng": data.lng ? data.lng : '',
                "pincode" : data.pincode ? data.pincode : ''
            }

            customerDAO.updateAddress(dataToSet, criteria, compData, (err, updateData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                } else {

                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Address Updated successfully" });

                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

/************ Get Store Detail ***********/
let getStoreDetail = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.vendor_id || !data.tab || !data.lat || !data.lng) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let UserData = {
                "user_id": data.vendor_id,
                "tab": data.tab,
                "service_type": data.service_type ? data.service_type : ''
            }

            customerDAO.getStoreDetail(UserData, (err, dbData) => {
                console.log('err+++++++++++++++++++++>', err)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
                    return;
                }
                if (dbData && dbData.length) {

                    // request('https://maps.googleapis.com/maps/api/distancematrix/json?origins=28.6692,77.4538&destinations=28.9845,77.7064&key=AIzaSyC3k63UyxqEz5Ma1KHbQ215QUZ83CtsYo8&sensor=false', function (error, response, body) {
                    //       console.error('error:', error); 
                    //       console.log('statusCode:', response && response.statusCode);
                    //     console.log('body:', body); 
                    //     let ab = JSON.parse(body);

                    //     if(ab.status == 'OK'){

                    //         console.log('ab----------------->',ab)
                    //         dbData['0'].distance = ab.rows[0].elements[0].distance.text ? ab.rows[0].elements[0].distance.text : '';
                    //         dbData['0'].time = ab.rows[0].elements[0].duration.text ? ab.rows[0].elements[0].duration.text : '';   
                    //     cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Store Data", "result": dbData['0'] });
                    //     return;
                    //     }else{

                    dbData['0'].distance = '';
                    dbData['0'].time = '';
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Store Data", "result": dbData['0'] });
                    return;
                    //}

                    //});
                } else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "No Data Found", "result": null });
                    return;
                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

/************ Get All Store ***********/
let getAllStore = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.lat || !data.lng || !data.category_id) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let UserData = {
                "category_id": data.category_id ? data.category_id : '',
                "lat": data.lat,
                "lng": data.lng
            }

            customerDAO.getAllStore(UserData, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
                    return;
                }
                if (dbData && dbData.length) {

                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Got All Stores", "result": dbData });
                    return;

                } else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "No Data Found", "result": [] });
                    return;
                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

/************ Get Product Variants ***********/
let getProductVariants = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.item_id) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let UserData = {
                "item_id": data.item_id ? data.item_id : ''
            }

            customerDAO.getProductVariants(UserData, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
                    return;
                }
                if (dbData && dbData.length) {

                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Got Product Variants", "result": dbData });
                    return;

                } else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "No Data Found", "result": [] });
                    return;
                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

/************ subscription ***********/
let subscription = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.item_id || !data.variant_id) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let UserData = {
                "item_id": data.item_id ? data.item_id : '',
                "variant_id": data.variant_id ? data.variant_id : ''
            }

            customerDAO.subscription(UserData, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
                    return;
                }
                if (dbData && dbData.length) {

                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Got Product Successfully", "result": dbData });
                    return;

                } else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "No Data Found", "result": [] });
                    return;
                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}


/************ add subscription ***********/
let addSubscription = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.item_id || !data.variant_id || !data.subscription_type || !data.quantity || !data.date || !data.size || !data.unit_type) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let UserData = {
                "user_id": userId,
                "item_id": data.item_id ? data.item_id : '',
                "variant_id": data.variant_id ? data.variant_id : '',
                "subscription_type": data.subscription_type ? data.subscription_type : '',
                "quantity": data.quantity ? data.quantity : 0,
                "date": data.date ? data.date : '',
                "size": data.size ? data.size : '',
                "status": '1',
                "unit_type": data.unit_type ? data.unit_type : '',
                "day": data.day ? data.day : ''
            }

            customerDAO.addSubscription(UserData, (err, dbData) => {
                console.log('error=================>', err)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
                    return;
                }
                else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Subscription Added Successfully" });
                    return;
                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

/***************  Add to Cart *****************/
let addToCart = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.item_id || !data.variant_id || !data.quantity || !data.category_id || !data.price || !data.vendor_id || !data.order_type) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let criteria = {
                user_id: userId,
                tab: data.tab ? data.tab : ''
            }

            let UserData = {
                "user_id": userId,
                "item_id": data.item_id ? data.item_id : '',
                "variant_id": data.variant_id ? data.variant_id : '',
                "category_id": data.category_id ? data.category_id : '',
                "quantity": data.quantity ? data.quantity : '0',
                "price": data.price ? data.price : '0',
                "vendor_id": data.vendor_id,
                "product_order_type": data.order_type,
                "sub_tab": data.sub_tab ? data.sub_tab : ''
            }

            customerDAO.addToCart(UserData, (err, dbData) => {
                console.log('error================>', err)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
                    return;
                } else {
                    if (dbData.res && dbData.res == '1') {
                        cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Add the same store's product checkout or clear the cart" });
                        return;
                    } else {
                        customerDAO.get_cart(criteria, (err1, dbData) => {
                            if (err1) {
                                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": util.statusMessage.DB_ERROR });
                                return;
                            } else {
                                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Added to cart successfully", "result": dbData.res, "total": dbData.total, "cartCount": dbData.res.length });

                                return;
                            }
                        });
                    }
                }

            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

/*************** Get Cart Detail *****************/
let getCart = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.tab) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let criteria = {
                user_id: userId,
                tab: data.tab ? data.tab : '',
                sub_tab: data.sub_tab ? data.sub_tab : '',
                coupon_code: data.coupon_code ? data.coupon_code : ''
            }

            customerDAO.get_cart(criteria, (err, dbData) => {
                //console.log('error================>', err, 'dbData=============', dbData)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": util.statusMessage.DB_ERROR });
                    return;
                } else {
                    //let len = dbData.res.length;
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Cart Got successfully", "result": dbData.res, "total": dbData.total, "tax": dbData.tax, "shipping_charge": dbData.shipping_charge, "total_amount": dbData.total_amount, "address": dbData.address ? dbData.address : {}, "cartCount": dbData.res.length, "minimum_order": dbData.minimum_order,"discount": dbData.discount, "discount_type": dbData.discount_type, "discount_value": dbData.discount_value, "coupon_type": dbData.coupon_type, "min_order_value": dbData.min_order_value});
                    return;
                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

/*************** Remove From Cart *****************/
let removeFromCart = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.cart_item_id) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let criteria = {
                user_id: userId,
                cart_item_id: data.cart_item_id ? data.cart_item_id : '',
                tab: data.tab ? data.tab : ''
            }

            customerDAO.removeFromCart(criteria, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": util.statusMessage.DB_ERROR });
                    return;
                } else {
                    // cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Item successfully removed from cart" });
                    // return;
                    customerDAO.get_cart(criteria, (err1, dbData) => {
                        if (err1) {
                            cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": util.statusMessage.DB_ERROR });
                            return;
                        } else {
                            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Item successfully removed from cart", "result": dbData.res, "total": dbData.total ? dbData.total : 0, "cartCount": dbData.res.length });
                            return;
                        }
                    });

                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

/* Cart count API */
let getCartCount = (headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let criteria = {
                user_id: userId
            }
            customerDAO.get_cart_count(criteria, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": util.statusMessage.DB_ERROR });
                    return;
                } else {
                    customerDAO.getNotificationCount(criteria, (err, dbData1) => {
                        if (err) {
                            cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": util.statusMessage.DB_ERROR });
                            return;
                        } else {
                            dbData['0'].notification_count = dbData1['0'].count;
                            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Cart count", "result": dbData['0'] });
                            return;
                        }
                    });
                }
            });
        }

    },
        (err, response) => {
            cb(response.checkUserExistsinDB);
        });
}

/*============ Place Order ==============*/
let placeOrder = (data, headers, cb) => {

    async.auto({
        checkUserExistsinDB: (cb) => {

            if (!data.order_unique_id || !data.address_id || !data.address_type || !data.address_user || !data.vendor_id || !data.order_price || !data.payment_mode || !data.order_type || !data.address || !data.lat || !data.lng) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
            //console.log('all Request++++++++++++++++++++++++++>>>.',data)
            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let criteria = {
              user_id: userId
            }

            let paytm_response;
           //console.log('data.paytm_response+++++++',data.response_paytm)
            if(data.response_paytm){
                console.log('=====aa rha hai')
                paytm_response = JSON.parse(JSON.parse(data.response_paytm));
               //console.log('paytm_response+++++++++++++++++>>>>>>>>>>>>>>3333333>>>>>>>>>>>',paytm_response)
               // console.log('paytm_response.BANKTXNID===',paytm_response.BANKTXNID)
            }
            //console.log('paytm_response.BANKTXNID===33333333333====',paytm_response.BANKTXNID)
           //console.log('paytm_response+++++++++++++++++>>>>>>>>>>>>>>3333333>>>>>>>>>>>',paytm_response)
            let dataToSet = {
                order_unique_id: data.order_unique_id,
                payment_mode: data.payment_mode,
                order_status: 'pending',
                order_price: data.order_price,
                address_id: data.address_id ? data.address_id : '0',
                vendor_id: data.vendor_id,
                order_type: data.order_type,
                address: data.address,
                lat: data.lat,
                lng: data.lng,
                user_id: userId,
                currency: 'Rs',
                sub_tab: data.sub_tab ? data.sub_tab : '',
                address_type: data.address_type ? data.address_type : '',

                discount: data.discount ? data.discount : '',
                coupon_code: data.coupon_code ? data.coupon_code : '',

                bnaktxn_id: paytm_response ? paytm_response.BANKTXNID : '',
                checksum_hash: paytm_response ? paytm_response.CHECKSUMHASH : '',
                paytm_order_id: paytm_response ? paytm_response.ORDERID : '',
                
                discount_value: data.discount_value ? data.discount_value : '',
                discount_type: data.discount_type ? data.discount_type : '',
                coupon_type: data.coupon_type ? data.coupon_type : '',
                min_order_value: data.min_order_value ? data.min_order_value : '',

                response_paytm: paytm_response?JSON.stringify(paytm_response):''

            }
        
    //console.log('+++++++++++++++check it++++++++++++++++++++>>>>>>>>>>>>>>>>>',dataToSet) 
    //return;
            customerDAO.is_item_blocked(dataToSet, (err2, check) => {
                if (err2) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                } else if (check['0'].count > 0) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": "Item is blocked or deleted" })
                } else {
                    customerDAO.placeOrder(dataToSet, (err, insertData) => {
                        console.log('place_order+++++++++++>>>>>>', err)
                        if (err) {
                            cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                        } else {
                            customerDAO.getUserData(criteria, (err1, dbData) => {
                                console.log(err1)
                                if (err1) {
                                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                                    return;
                                } else {
                                    //console.log('insertData+++++++++>',insertData)
                                    let order_data = {
                                        'name': dbData['0'].name,
                                        'order_id': insertData['0'].order_unique_id,
                                        'type': data.type,
                                        'payment_mode': data.payment_mode,
                                        'currency': data.currency,
                                        'order_price': parseFloat(data.order_price),
                                        'order_status': 'pending',
                                        'order_date': insertData['0'].added_on,
                                        'lat': data.lat,
                                        'lng': data.lng,
                                        'address_name': data.address_user,
                                        'address': data.address
                                    }
                                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Order Placed Successfully", "order_details": insertData, "order_data": order_data });
                                }
                            });
                        }
                    });
                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}


/*============ Place Order ==============*/
let home = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {

            if (!data.lat || !data.lng) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })


            let dataToSet = {
                user_id: userId,
                lat: data.lat ? data.lat : '',
                lng: data.lng ? data.lng : ''
            }
             
            customerDAO.getUsersDetails(dataToSet, (err2, userData) => {
                if (err2) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                } else {
                    customerDAO.getBannerTop(dataToSet, (err, bannerDataTop) => {
                        if (err) {
                            cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                        } else {
                            customerDAO.getBannerMidTop(dataToSet, (errmt, bannerDataMidTop) => {
                                if (errmt) {
                                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                                } else {
                                  customerDAO.getBannerMidBottom(dataToSet, (errmb, bannerDataMidBottom) => {
                                        if (errmb) {
                                            cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                                        } else {
                                           customerDAO.getBannerBottom(dataToSet, (errb, bannerDataBottom) => {
                                                if (errb) {
                                                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                                                } else {

                            customerDAO.getInstantServices(dataToSet, (err1, instantCategoryData) => {
                                if (err1) {
                                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                                    return;
                                } else {
                                customerDAO.getDailyServices(dataToSet, (err3, dailyCategoryData) => {
                                        console.log(err3)
                                        if (err3) {
                                            cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })
                                            return;
                                        } else {
                                            cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Got home successfully", "user": userData, "banner_top": bannerDataTop, "banner_mid_top": bannerDataMidTop, "banner_mid_bottom": bannerDataMidBottom,"banner_bottom": bannerDataBottom, "daily_services": dailyCategoryData, "instant_services": instantCategoryData });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
                        }
                    });
                        }
                    });
                }
            });
        }
    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

/* Clear cart API */
let clearCart = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {

            if (!data.service_type) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let criteria = {
                user_id: userId,
                service_type: data.service_type? data.service_type:'normal'
            }

            customerDAO.clearCart(criteria, (err, dbData) => {
                console.log('err+++++++++++',err)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": util.statusMessage.DB_ERROR });
                    return;
                } else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Cart cleared successfully" });
                    return;
                }
            });
        }

    },
        (err, response) => {
            cb(response.checkUserExistsinDB);
        });
}

/* check coupon code */
let checkCouponCode = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {

            if (!data.coupon_code || !data.vendor_id || !data.amount || !data.tab) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let criteria = {
                user_id: userId,
                coupon_code: data.coupon_code? data.coupon_code:'',
                vendor_id: data.vendor_id? data.vendor_id:''
            }

            customerDAO.checkCouponCode(criteria, (err, dbData) => {
                console.log(err)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": util.statusMessage.DB_ERROR });
                    return;
                } else {
                    if(dbData && dbData.length){
                    if(dbData[0].min_order_value <= data.amount){

                    if(dbData[0].coupon_type == data.tab || dbData[0].coupon_type == 'both'){

                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Valid Coupon" });
                    return;

                    }else{
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": `Counpon is not valid for ${data.tab}` });
                        return;       
                    }

                        }else{
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": 'Amount is less then for coupon code' });
                    return;
                        }
                    }else{
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": 'Invalid coupon code' });
                        return;  
                    }
                }
            });
        }

    },
        (err, response) => {
            cb(response.checkUserExistsinDB);
        });
}

/* change address API */
let changeAddress = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {

            if (!data.address_id) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }

            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let criteria = {
                user_id: userId,
                address_id: data.address_id
            }
            customerDAO.changeAddress(criteria, (err, dbData) => {
                console.log('err+++++++++++++++>', err)
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": util.statusMessage.DB_ERROR });
                    return;
                } else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Address changed successfully" });
                    return;
                }
            });
        }

    },
        (err, response) => {
            cb(response.checkUserExistsinDB);
        });
}

/* Paytm checksum API */
// let createChecksumhash = (req, headers, res) => {

// 	//const userId = req.headers.decoded_id;
//     var userId
//     util.jwtDecode(headers.accesstoken, (err, token) => {
//         userId = token
//     })

//     //const { txnAmount, callbackUrl, websiteName } = req.body;
// 	async.waterfall([
// 		// (cb) => {
// 		// 	const temp = {
// 		// 		receiverId: userId,
// 		// 		amountAdd: txnAmount.value,
// 		// 		transactionMode: "WALLET_RECHARGE",
// 		// 		status: "INITIATED",
// 		// 		paymentMode: "PAYTM",
// 		// 	}
// 		// 	console.log("v6 hot here")
// 		// 	transactionSchema.create(temp, (err, dbData) => {
// 		// 		// console.log("err, dbData", err, dbData);
// 		// 		if (err) {
// 		// 			return cb(apiResponse.ErrorResponse(res, statusMessage.DB_ERROR), null);
// 		// 		}
// 		// 		transactionSchema.findOneAndUpdate({ _id: dbData._id }, { $set: { paymentGatewayOrderId: dbData._id } }, { new: true }, (err, dbData) => {
// 		// 			if (err) {
// 		// 				return cb(apiResponse.ErrorResponse(res, statusMessage.DB_ERROR), null);
// 		// 			}
// 		// 			dbData.transaction_id = dbData._id
					
// 		// 			availRechargeBonus(userId, townId, dbData);
// 		// 			cb(null, dbData);
// 		// 		})
// 		// 	})
// 		// },

// 		// async (paymentData, cb) => {
// 		// 	console.log("payment id")
// 		// 	console.log(paymentData.transaction_id)
// 		// 	let user_id = paymentData.receiverId
// 		// 	let transaction_id = paymentData._id
// 		// 	let dbData = await userSchema.findOne({ _id: user_id })
// 		// 	let cityid = ""
// 		// 	if (dbData) {
// 		// 		if (dbData.location.length == 1) {
// 		// 			cityid = dbData.location[0].city
// 		// 		} else {
// 		// 			var pos = dbData.location.map(function (e) {
// 		// 				return e.default;
// 		// 			}).indexOf('PRIMARY');
// 		// 			cityid = dbData.location[pos].city
// 		// 		}
// 		// 	}
// 		// 	let gfsdetails = await gfsSchema.findOne({ townId: cityid }, { _id: 1 })
// 		// 	let gfs_id = gfsdetails._id
// 		// 	await transactionSchema.findOneAndUpdate({ _id: transaction_id }, { gfsId: gfs_id }, { new: true })
// 		// 	return paymentData
// 		// },
// 		(cb) => {
// 			//const PaytmChecksum = require('../paytmchecksum');
//             const PaytmChecksum = require('paytmchecksum');

// 			var paytmParams = {};
// 			paytmParams.body = {
// 				"requestType": "Payment",
// 				"mid": process.env.Merchant_ID,
// 				"websiteName":"WEBSTAGING",
// 				"orderId": '213123',
// 				"callbackUrl": "https://merchant.com/callback",
// 				"txnAmount": {
// 					"value": '100',
// 					"currency": "INR",
// 				},
// 				"userInfo": {
// 					"custId": '321',
// 				},
// 			};
// 			PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.Merchant_Key).then(function (checksum) {

// 				paytmParams.head = {
// 					"signature": checksum
// 				};

// 				var post_data = JSON.stringify(paytmParams);

// 				var options = {

// 					// for Staging /
// 					hostname: 'securegw-stage.paytm.in',

// 					/// for Production /
// 					// hostname: 'pawan@servicekaart.com',

// 					port: 443,
// 					path: `/theia/api/v1/initiateTransaction?mid=${process.env.Merchant_ID}&orderId=${paytmParams.body.orderId}`,
// 					method: 'POST',
// 					headers: {
// 						'Content-Type': 'application/json',
// 						'Content-Length': post_data.length
// 					}
// 				};

// 				var response = "";
// 				var post_req = https.request(options, function (post_res) {
// 					post_res.on('data', function (chunk) {
// 						response += chunk;
// 					});

// 					post_res.on('end', function () {
// 						console.log('Response: ', response);
// 						response = JSON.parse(response);
// 						response.checksumReq = paytmParams.body
// 						cb(null, response)
// 					});
// 				});

// 				post_req.write(post_data);
// 				post_req.end();
// 			});
// 		}
// 	], (err, result) => {
// 		if (err) return;
// 		//apiResponse.successResponseWithData(res, statusMessage.success, result);
//         res({result});
// 	})

// }

/* Paytm checksum API */
let createChecksumhash = (req, headers, res) => {

	//const userId = req.headers.decoded_id;
    

    var userId
    util.jwtDecode(headers.accesstoken, (err, token) => {
        userId = token
    })
   console.log('------------------',userId)
    async.waterfall([
		(cb) => {
            if (!req.order_id || !req.price) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING })
                return;
            }
			const PaytmChecksum = require('paytmchecksum');
            var paytmParams = {};
			paytmParams.body = {
				"requestType": "Payment",
				"mid": process.env.Merchant_ID,
				"websiteName":"WEBSTAGING",
				"orderId": req.order_id,
				"callbackUrl": "https://merchant.com/callback",
				"txnAmount": {
					"value": req.price,
					"currency": "INR",
				},
				"userInfo": {
					"custId": userId,
				},
			};
			PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.Merchant_Key).then(function (checksum) {

				paytmParams.head = {
					"signature": checksum
				};

				var post_data = JSON.stringify(paytmParams);

				var options = {

					// for Staging /
					hostname: 'securegw-stage.paytm.in',

					/// for Production /
					// hostname: 'pawan@servicekaart.com',

					port: 443,
					path: `/theia/api/v1/initiateTransaction?mid=${process.env.Merchant_ID}&orderId=${paytmParams.body.orderId}`,
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Content-Length': post_data.length
					}
				};

				var response = "";
				var post_req = https.request(options, function (post_res) {
					post_res.on('data', function (chunk) {
						response += chunk;
					});

					post_res.on('end', function () {
						console.log('Response: ', response);
						response = JSON.parse(response);
						response.checksumReq = paytmParams.body
						cb(null, response)
					});
				});

				post_req.write(post_data);
				post_req.end();
			});
		}
	], (err, result) => {
		if (err) return;
		//apiResponse.successResponseWithData(res, statusMessage.success, result);
        res({result});
	})

}


module.exports = {
    checkMobile: checkMobile,
    checkEmail: checkEmail,
    signup: signup,
    login: login,
    socialCheck: socialCheck,
    updateDeviceToken: updateDeviceToken,
    updateProfile: updateProfile,
    getDetails: getDetails,
    addAddress: addAddress,
    getAddresses: getAddresses,
    deleteAddress: deleteAddress,
    updateAddress: updateAddress,
    getCategory: getCategory,
    getStoreDetail: getStoreDetail,
    getAllStore: getAllStore,
    getProductVariants: getProductVariants,
    subscription: subscription,
    addSubscription: addSubscription,
    addToCart: addToCart,
    getCart: getCart,
    removeFromCart: removeFromCart,
    getCartCount: getCartCount,
    placeOrder: placeOrder,
    clearCart: clearCart,
    signupWeb: signupWeb,
    changeAddress: changeAddress,
    home: home,
    createChecksumhash: createChecksumhash,
    getCustomerRecentAddresses: getCustomerRecentAddresses,
    checkCouponCode: checkCouponCode
}



///////////////////////////////////////////////////////////////////////////////////////////////

function validate(requestData, requiredFields, callback) {
    let validateErros = {};
    if (requiredFields.length > 0) {
        requiredFields.forEach(function (item, index) {
            if (typeof requestData[item] === 'undefined' || requestData[item] == '') {
                validateErros[item] = 'Field cannot be empty.';
            }
        });
    }
    callback(validateErros);
}
///////////////////////////////////////////////////////////////////////////////////////////////