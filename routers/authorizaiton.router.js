const express = require('express');

const controller = require('../controllers/crwalData');
// const validation = require('../validations/auth.validation');

var router = express.Router();

router.post('/init', controller.initProductData);

module.exports = router;