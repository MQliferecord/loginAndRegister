const express = require('express');
const router = express.Router();
let Follow = require('../constrollers/FollowerControllers')

router.post('/follow',Follow.follow)
module.exports = router