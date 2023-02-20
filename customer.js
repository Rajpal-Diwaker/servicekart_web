/*
 * @Author: Shahnazar Saifi
 * @Date: April 5, 2021
 */

let express = require('express'),
    router = express.Router(),
    util = require('../Utilities/util'),
    customerService = require('../Services/customer');
authHandler = require('../middleware/verifyToken');


/* check Mobile */
router.post('/checkMobile', (req, res) => {
    customerService.checkMobile(req.body, (data) => {
        res.send(data);
    });
});

/* check Email */
router.post('/checkEmail', (req, res) => {
    customerService.checkEmail(req.body, (data) => {
        res.send(data);
    });
});

/* customer signup */
router.post('/customerSignUp', (req, res) => {
    customerService.signup(req.body, (data) => {
        res.send(data);
    });
});

/* customer signup */
router.post('/customerSignUpWeb', (req, res) => {
    customerService.signupWeb(req, (data) => {
        res.send(data);
    });
});

/* customer signup */
router.post('/customerSocialCheck', (req, res) => {
    customerService.socialCheck(req.body, (data) => {
        res.send(data);
    });
});

/* customer login */
router.post('/customerLogin', (req, res) => {
    customerService.login(req.body, (data) => {
        res.send(data);
    });
});

/* update device token */
router.post('/updateDeviceToken', authHandler.verifyToken, (req, res) => {
    customerService.updateDeviceToken(req.body, req.headers, (data) => {
        res.send(data);
    });

});

/* update profile */
router.post('/updateProfile', authHandler.verifyToken, (req, res) => {
    customerService.updateProfile(req.body, req.headers, (data) => {
        res.send(data);
    });

});

/* customer account details */
router.get('/getDetails', authHandler.verifyToken, (req, res) => {
    customerService.getDetails(req.body, req.headers, (data) => {
        res.send(data);
    });

});

/* Add Address */
router.post('/addAddress', authHandler.verifyToken, (req, res) => {
    customerService.addAddress(req.body, req.headers, (data) => {
        res.send(data);
    });

});

/* customer Addressess details */
router.get('/getCustomerAddresses', authHandler.verifyToken, (req, res) => {
    customerService.getAddresses(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Delete Address */
router.post('/deleteAddress', authHandler.verifyToken, (req, res) => {
    customerService.deleteAddress(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Update Address */
router.post('/updateAddress', authHandler.verifyToken, (req, res) => {
    customerService.updateAddress(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* category list */
router.post('/getCategory', authHandler.verifyToken, (req, res) => {
    customerService.getCategory(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* get store detail */
router.post('/getStoreDetail', authHandler.verifyToken, (req, res) => {
    customerService.getStoreDetail(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Get All Store */
router.post('/getAllStore', authHandler.verifyToken, (req, res) => {
    customerService.getAllStore(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Get Product Variants */
router.post('/getProductVariants', authHandler.verifyToken, (req, res) => {
    customerService.getProductVariants(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Subscription */
router.post('/subscription', authHandler.verifyToken, (req, res) => {
    customerService.subscription(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Add Subscription */
router.post('/addSubscription', authHandler.verifyToken, (req, res) => {
    customerService.addSubscription(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Add to cart */
router.post('/addToCart', authHandler.verifyToken, (req, res) => {
    customerService.addToCart(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Get Cart */
router.post('/getCart', authHandler.verifyToken, (req, res) => {
    //console.log('8888888888888888888888888');
    customerService.getCart(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Remove From Cart */
router.post('/removeFromCart', authHandler.verifyToken, (req, res) => {
    customerService.removeFromCart(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Cart Count */
router.get('/getCartCount', authHandler.verifyToken, (req, res) => {
    customerService.getCart(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Place Order */
router.post('/placeOrder', authHandler.verifyToken, (req, res) => {
    customerService.placeOrder(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Place Order */
router.post('/changeAddress', authHandler.verifyToken, (req, res) => {
    customerService.changeAddress(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Place Order */
router.post('/home', authHandler.verifyToken, (req, res) => {
    customerService.home(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Clear Cart */
router.post('/clearCart', authHandler.verifyToken, (req, res) => {
    customerService.clearCart(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Paytm checksum API */
router.post('/createChecksumhash', authHandler.verifyToken, (req, res) => {
    customerService.createChecksumhash(req.body, req.headers, (data) => {
        res.send(data);
    });
});

/* Check Coupon Code */
router.post('/checkCouponCode', authHandler.verifyToken, (req, res) => {
    customerService.checkCouponCode(req.body, req.headers, (data) => {
        res.send(data);
    });
});


/* customer last 5 address details */
router.get('/getCustomerRecentAddresses', authHandler.verifyToken, (req, res) => {
    customerService.getCustomerRecentAddresses(req.body, req.headers, (data) => {
        res.send(data);
    });
});

module.exports = router;