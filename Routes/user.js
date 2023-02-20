/*
 * @Author: Tripti Bhardwaj
 * @Date: April 5, 2021
 */

let express = require('express'),
    router = express.Router(),
    util = require('../Utilities/util'),
    vendorService = require('../Services/vendor');
authHandler = require('../middleware/verifyToken');


/* check Mobile */
router.post('/checkMobile', (req, res) => {
    vendorService.checkMobile(req.body, (data) => {
        res.send(data);
    });
});

/* check Email */
router.post('/checkEmail', (req, res) => {
    vendorService.checkEmail(req.body, (data) => {
        res.send(data);
    });
});

/* vendor signup */
router.post('/vendorSignUp', (req, res) => {
    vendorService.signup(req.body, (data) => {
        res.send(data);
    });
});

/* vendor login */
router.post('/vendorLogin', (req, res) => {
    vendorService.login(req.body, (data) => {
        res.send(data);
    });
});

/* vendor account details */
router.get('/getDetails', authHandler.verifyToken, (req, res) => {
    vendorService.getDetails(req.body, req.headers, (data) => {
        res.send(data);
    });

});

/* update device token */
router.post('/updateDeviceToken', authHandler.verifyToken, (req, res) => {
    vendorService.updateDeviceToken(req.body, req.headers, (data) => {
        res.send(data);
    });

});

/* update profile */
router.post('/updateProfile', authHandler.verifyToken, (req, res) => {
    vendorService.updateProfile(req.body, req.headers, (data) => {
        res.send(data);
    });

});

/* update store timings */
router.post('/updateStoreTimings', authHandler.verifyToken, (req, res) => {
    vendorService.updateStoreTimings(req.body, req.headers, (data) => {
        res.send(data);
    });

});

/* add delivery charge */
router.post('/addDeliveryCharge', authHandler.verifyToken, (req, res) => {
    vendorService.addDeliveryCharge(req.body, req.headers, (data) => {
        res.send(data);
    });

});
/* add delivery executive */
router.post('/addDeliveryExecutive', authHandler.verifyToken, (req, res) => {
    vendorService.addDeliveryExecutive(req.body, req.headers, (data) => {
        res.send(data);
    });

});

/* vendor list details */
router.get('/getDeliveryDetails', authHandler.verifyToken, (req, res) => {
    vendorService.getDeliveryDetails(req.body, req.headers, (data) => {
        res.send(data);
    });

});


module.exports = router;