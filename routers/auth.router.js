const express = require('express');

const controller = require('../controllers/auth.controller');
const validation = require('../validations/auth.validation');

var router = express.Router();

router.get('/forgot/resetPassword', controller.resetPassword);
router.get('/forgot/verifyCode', controller.verifyCode);
router.get('/forgot', controller.forgotPassword);
router.get('/register', controller.register);
router.get('/login', controller.login);
router.get('/verifyCode', controller.verifyCode);

router.post('/forgot/resetPassword', controller.postResetPassword);
router.post('/forgot/verifyCode', controller.postVerifyForgot);
router.post('/forgot', controller.postForgotPassword);
router.post('/register', validation.postAuthentication, controller.postRegister);
router.post('/login', controller.postLogin);
router.post('/verifyCode', controller.postVerifyCode);

module.exports = router;