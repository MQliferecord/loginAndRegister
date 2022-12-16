var express = require('express');
var router = express.Router();
let User = require('../constrollers/UserControllers');

router.post('/sendCode',User.sendCode);
router.post('/sendCoreCode',User.sendCoreCode);
router.post('/codeAndPhoneReg',User.codeAndPhoneReg);
router.post('/loginAccess',User.loginAccess);

module.exports = router