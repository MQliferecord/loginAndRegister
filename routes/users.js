var express = require('express');
var router = express.Router();
let multer = require('multer')
let User = require('../constrollers/UserControllers');
let upload = multer({dest:'./public/uploads/'}).single('file')
let mutilUpload = multer({dest:'./public/uploads/'}).array('file',10)
/* GET users listing. */

router.post('/modifUserInfoAccess',User.modifUserInfoAccess);
router.post('/modifUserNameAccess',User.modifUserNameAccess);
router.post('/modifPwdAccess',User.modifPwdAccess);
router.post('/bindEmailAddr',User.bindEmailAddr);
router.post('/editUserImg',upload,User.editUserImg);
router.post('/mutilFileUpload',mutilUpload,User.mutilFileUpload);
router.post('/publishVideo',User.publishVideo);
router.post('/logoutAccess',User.logoutAccess)

module.exports = router;
