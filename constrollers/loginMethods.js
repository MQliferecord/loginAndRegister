const { JsonWebTokenError } = require('jsonwebtoken');
let dbConf = require('../util/dbconfig');
const REGMETHOD = require('./registerMethods')
const USERINFO = require('./userinfoMethods')

let loginUser = async (username,phone) => {
    let sql = `select * from user where username=? or phone=?`;
    let sqlArr = [username, phone];
    let result = await dbConf.sqlPromise(sql, sqlArr);
    if (result.length) {
        //已注册
        result[0].userinfo = await USERINFO.getUserInfo(result[0].username,'username')
        return result
    } else {
        //未注册
        let result = await REGMETHOD.regUser(phone)
        result[0].userinfo = await USERINFO.getUserInfo(result[0].username,'username')
        return result
    }
}
module.exports = {
    loginUser
}