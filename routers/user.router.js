const express = require('express');
const multer  = require('multer');

var upload = multer({ dest: 'public/uploads/' })

const controller = require('../controllers/user.controller');

var router = express.Router();

router.get('/purchase', controller.purchase);
router.get('/account', controller.account);
router.get('/checkout/', controller.checkout);
router.get('/addToCart/:productId', controller.addToCart);
router.get('/logout', controller.logout);
router.get('/cart', controller.cart);
router.get('/cart/delete/:productId', controller.removeItemCart);
router.get('/purchase/confirm/:billId', controller.confirmDeliveredProduct);
router.get('/purchase/delete/:billId', controller.cancelBill);


router.post('/account', upload.single('avatar'), controller.postAccout);
router.post('/checkout/', controller.postCheckout);

module.exports = router;