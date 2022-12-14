var express = require('express');
var router = express.Router();
let cate = require('../constrollers/cateController')
/* GET home page. */
router.get('/', cate.getCate);
router.get('/getPostCate',cate.getPostCate);

module.exports = router;
