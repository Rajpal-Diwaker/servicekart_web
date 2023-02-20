/*
 * @Author: Tripti Bhardwaj
 * @Date: April 5, 2021
 */


let async = require('async'),
    jwt = require('jsonwebtoken');
let dbConfig = require("../Utilities/dbConfig");

let util = require('../Utilities/util'),
    config = require('../Utilities/Config'),
    vendorDAO = require('../DAO/vendorDAO');

// let FCM = require('fcm-node');
// // let driverserverKey = 'AAAA_1psqb0:APA91bH1bHT_GHx_M4Qn97-vRDAxgdVf4NqknmwciHXRRU64W2BGwlU0UjpX5RcPDuZIJxZIEDcBIl5-xyXM2SUIzP35gRB_29GIMBLn9Jl1JPQkCaDDDNFD7HZow74VuPh7qXBkBzrU'; //put your server key here
// let driverserverKey = 'AAAABOhrkPQ:APA91bEXkat1xH4M04jKGPHOBZePJQ83n4nD3mSHQXQY8uRbckT5oLzCj4LafFgg7R1LSzvH_s97eoMHw0OyJtV-6xvhn9OLxdLhWOpJm38OAWzR3YSLjsclQ0dKO1Hny4J_lS8P-25t'; //put your server key here
// let driverfcm = new FCM(driverserverKey);


/****** Mobile Validation API *****/
let checkMobile = (data, cb) => {
    if (!data.mobile_no || !data.user_type) {
        cb({ "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING, "result": null })
        return;
    }
    let UserData = {
        mobile_no: data.mobile_no,
        user_type: data.user_type
    }
    vendorDAO.getUsers(UserData, (err, dbData) => {
        if (err) {
            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
            return;
        }
        if (dbData && dbData.length) {
            cb({ "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": util.statusMessage.MOBILE_EXIST, "result": null });
            return;
        } else {
            cb({ "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.NEW_MOBILE, "result": null });
            return;
        }
    });
}

/****** Email Validation API *****/
let checkEmail = (data, cb) => {
    if (!data.email_id || !data.user_type) {
        cb({ "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING, "result": null })
        return;
    }
    let UserData = {
        email_id: data.email_id,
        user_type: data.user_type
    }
    vendorDAO.getUsers(UserData, (err, dbData) => {
        if (err) {
            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
            return;
        }
        if (dbData && dbData.length) {
            cb({ "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": util.statusMessage.EMAIL_EXIST, "result": null });
            return;
        } else {
            cb({ "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.NEW_EMAIL, "result": null });
            return;
        }
    });
}

/******* signup API *******/
let signup = (data, cb) => {
    async.auto({
            checkUserExistsinDB: (cb) => {
                if (!data.country_code || !data.mobile_no || !data.store_name || !data.user_type || !data.email_id || !data.password || !data.open_days) {
                    cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING, "result": null })
                    return;
                }
                let criteria1 = {
                    mobile_no: data.mobile_no,
                    user_type: data.user_type
                }
                vendorDAO.getUsers(criteria1, (err, dbData1) => {
                    if (err) {
                        cb(null, {
                            "statusCode": util.statusCode.INTERNAL_SERVER_ERROR,
                            "statusMessage": util.statusMessage.DB_ERROR,
                            "result": null
                        })
                        return;
                    }
                    if (dbData1 && dbData1.length) {
                        cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": util.statusMessage.MOBILE_EXIST, "result": null });
                        return;
                    } else {
                        let criteria2 = {
                            email_id: data.email_id,
                            user_type: data.user_type
                        }
                        vendorDAO.getUsers(criteria2, (err, dbData2) => {
                            if (err) {
                                cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null })
                                return;
                            }
                            if (dbData2 && dbData2.length) {
                                cb(null, { "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": util.statusMessage.EMAIL_EXIST, "result": null });
                                return;
                            } else {
                                var vendorData = {
                                    "email_id": data.email_id ? data.email_id : '',
                                    "country_code": data.country_code ? data.country_code : '',
                                    "mobile_no": data.mobile_no ? data.mobile_no : '',
                                    "profile_pic": data.store_logo ? data.store_logo : '',
                                    "password": data.password ? util.encryptData(data.password) : '',
                                    "user_type": data.user_type ? data.user_type : 'vendor',
                                    "status": "1",
                                    "role": null,
                                }
                                vendorDAO.createUser(vendorData, (err, dbData) => {
                                    if (err) {
                                        cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
                                        return;
                                    } else {
                                        let criteria = {
                                            mobile_no: data.mobile_no,
                                            user_type: data.user_type
                                        }
                                        vendorDAO.getUsers(criteria, (err, dbData) => {
                                            if (err) {
                                                cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null })
                                                return;
                                            }
                                            if (dbData && dbData.length) {
                                                var vendorDetails = {
                                                    "user_id": dbData[0].user_id,
                                                    "store_name": data.store_name ? data.store_name : '',
                                                    "store_type": data.store_type ? data.store_type : '',
                                                    "store_address": data.store_address ? data.store_address : '',
                                                    "registration_number": data.registration_number ? data.registration_number : '',
                                                    "gstin_number": data.gstin_number ? data.gstin_number : '',
                                                    "currency": data.currency ? data.currency : '',
                                                    "minimum_order": data.minimum_order ? data.minimum_order : '',
                                                    "twitter_profile": data.twitter_profile ? data.twitter_profile : '',
                                                    "instagram_profile": data.instagram_profile ? data.instagram_profile : '',
                                                    "facebook_profile": data.facebook_profile ? data.facebook_profile : '',
                                                    "pan_card": data.pan_card ? data.pan_card : '',
                                                    "gst": data.gst ? data.gst : '',
                                                }

                                                JSON.parse(data.open_days).forEach(element => {
                                                    var timings = {
                                                        "user_id": dbData[0].user_id,
                                                        "day": element.day,
                                                        "open_time": element.open_time,
                                                        "close_time": element.close_time,
                                                        "status": element.open_time == '00:00' ? "0" : "1"
                                                    }
                                                    vendorDAO.createUserTimings(timings, (err, timeData) => {
                                                        if (err) {
                                                            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null })
                                                            return;
                                                        }
                                                    });
                                                });


                                                vendorDAO.createUserInfo(vendorDetails, (err, dbData1) => {
                                                    if (err) {
                                                        cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null })
                                                        return;
                                                    } else {
                                                        const token = jwt.sign({ id: dbData[0].user_id }, 'SERVICE_KART', {})
                                                        dbData[0].token = token;
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
                });
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

            if (!data.email_id || !data.password || !data.user_type) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING, "result": null })
                return;
            }

            let criteria = {
                email_id: data.email_id,
                password: util.encryptData(data.password),
                user_type: data.user_type
            }
            vendorDAO.getUsersLogin(criteria, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null })
                }
                if (dbData && dbData.length) {

                    const token = jwt.sign({ id: dbData[0].user_id }, 'SERVICE_KART', {})
                    dbData[0].token = token
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": util.statusMessage.LOGIN_SUCCESS, "result": dbData[0] });
                } else {
                    cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.INCORRECT_CREDENTIALS, "result": null });
                }

            });
        }
    }, (err, response) => {
        callback(response.checkUserExistsinDB);
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
    vendorDAO.getUserData(UserData, (err, dbData) => {
        if (err) {
            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
            return;
        }
        if (dbData && dbData.length) {
            const token = jwt.sign({ id: dbData[0].user_id }, 'SERVICE_KART', {})
            dbData[0].token = token
            cb({ "statusCode": util.statusCode.OK, "statusMessage": "Profile Data", "result": dbData['0'] });
            return;
        } else {
            cb({ "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": "User Not Exist", "result": null });
            return;
        }
    });
}

// update device token
let updateDeviceToken = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.device_token && !data.device_type) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING, "result": null })
                return;
            }
            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let criteria = {
                user_id: userId
            }
            vendorDAO.getUsers(criteria, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
                    return;
                }
                if (dbData && dbData.length == 0) {
                    cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.INCORRECT_USER, "result": null });
                    return;
                } else {
                    let dataToSet = {
                        device_token: data.device_token,
                        device_type: data.device_type
                    }
                    vendorDAO.updateDeviceToken(criteria, dataToSet, (err, updateData) => {
                        if (err) {
                            cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null })
                        }

                        vendorDAO.getUserData(criteria, (err, dbData) => {
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
            if (!data.mobile_no || !data.store_name || !data.email_id) {
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
                country_code: data.country_code,
                mobile_no: data.mobile_no,
                store_name: data.store_name,
                store_address: data.store_address,
                minimum_order: data.minimum_order,
                email_id: data.email_id,
                twitter_profile: data.twitter_profile ? data.twitter_profile : '',
                instagram_profile: data.instagram_profile ? data.instagram_profile : '',
                facebook_profile: data.facebook_profile ? data.facebook_profile : '',
                profile_pic: data.profile_pic
            }

            vendorDAO.updateProfile(criteria, dataToSet, (err, updateData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR })

                } else {
                    vendorDAO.getUserData(criteria, (err, dbData) => {
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


// update store timings
let updateStoreTimings = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.store_timings) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING, "result": null })
                return;
            }
            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let criteria = {
                user_id: userId
            }
            vendorDAO.getUsers(criteria, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.FOUR_ZERO_FOUR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
                    return;
                }
                if (dbData && dbData.length == 0) {
                    cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.INCORRECT_USER, "result": null });
                    return;
                } else {
                    data.store_timings.forEach(element => {
                        let criteria1 = {
                            user_id: userId,
                            day: element.day,
                        }
                        var timings = {
                            "day": element.day,
                            "open_time": element.open_time,
                            "close_time": element.close_time,
                            "status": element.status
                        }
                        vendorDAO.updateStoreTimings(criteria1, timings, (err, updateData) => {
                            if (err) {
                                cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null })
                            }

                            vendorDAO.getUserData(criteria, (err, dbData) => {
                                if (err) {
                                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null })
                                    return;
                                }


                                const token = jwt.sign({ id: dbData[0].user_id }, 'SERVICE_KART', {})
                                dbData[0].token = token

                                cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Updated Successfully", "result": data.store_timings });
                            });
                        });
                    });
                }

            });
        }

    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

// Add Delivery Charge
let addDeliveryCharge = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.base_delivery_charge && !data.delivery_charge_per_km) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING, "result": null })
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
                base_delivery_charge: data.base_delivery_charge,
                delivery_charge_per_km: data.delivery_charge_per_km
            }
            vendorDAO.addDeliveryCharge(criteria, dataToSet, (err, updateData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null })
                } else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Delivery Charges added successfully", "result": dataToSet });
                }
            });

        }

    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

// Add Delivery Executive
let addDeliveryExecutive = (data, headers, cb) => {
    async.auto({
        checkUserExistsinDB: (cb) => {
            if (!data.name && !data.country_code && !data.mobile_no && !data.image) {
                cb(null, { "statusCode": util.statusCode.BAD_REQUEST, "statusMessage": util.statusMessage.PARAMS_MISSING, "result": null })
                return;
            }
            var userId
            util.jwtDecode(headers.accesstoken, (err, token) => {
                userId = token
            })

            let dataToSet = {
                vendor_id: userId,
                full_name: data.name,
                country_code: data.country_code,
                mobile_no: data.mobile_no,
                image: data.image
            }
            vendorDAO.addDeliveryExecutive(dataToSet, (err, dbData) => {
                if (err) {
                    cb(null, { "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null })
                } else {
                    cb(null, { "statusCode": util.statusCode.OK, "statusMessage": "Delivery Executive added successfully", "result": dataToSet });
                }
            });

        }

    }, (err, response) => {
        cb(response.checkUserExistsinDB);
    })
}

/****** Get Delivery API *****/
let getDeliveryDetails = (data, headers, cb) => {
    var userId
    util.jwtDecode(headers.accesstoken, (err, token) => {
        userId = token

    })
    let UserData = {
        user_id: userId
    }
    vendorDAO.getVendorList(UserData, (err, dbData) => {
        if (err) {
            cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
            return;
        }
        var result = {};
        if (dbData && dbData.length) {
            vendorDAO.getDeliveryData(UserData, (err, dbData1) => {
                if (err) {
                    cb({ "statusCode": util.statusCode.INTERNAL_SERVER_ERROR, "statusMessage": util.statusMessage.DB_ERROR, "result": null });
                    return;
                }
                const token = jwt.sign({ id: dbData[0].user_id }, 'SERVICE_KART', {})
                dbData[0].token = token

                result['vendors'] = dbData;
                result['delivery_data'] = dbData1['0'];

                cb({ "statusCode": util.statusCode.OK, "statusMessage": "Delivery Data", "result": result });
                return;
            });
        } else {
            cb({ "statusCode": util.statusCode.FOUR_ZERO_ZERO, "statusMessage": "User Not Exist", "result": null });
            return;
        }
    });
}

module.exports = {
    checkMobile: checkMobile,
    checkEmail: checkEmail,
    signup: signup,
    login: login,
    getDetails: getDetails,
    updateDeviceToken: updateDeviceToken,
    updateProfile: updateProfile,
    updateStoreTimings: updateStoreTimings,
    addDeliveryCharge: addDeliveryCharge,
    addDeliveryExecutive: addDeliveryExecutive,
    getDeliveryDetails: getDeliveryDetails
}