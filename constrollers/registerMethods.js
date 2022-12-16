let dbConf = require('../util/dbconfig');
let USER = require('./userinfoMethods')

let regUser = async (phone) => {
    //检测用户是否已经注册
    let phoneAcc = /^1[3456789]\d{9}$/
    if (phoneAcc.test(phone)) {
        let sql = `insert into user(username,phone) value(?,?)`;
        //第一次注册username使用phone
        let sqlArr = [phone,phone];
        let result = await dbConf.sqlPromise(sql, sqlArr);
        if (result.affectedRows == 1) {
            //注册用户成功
            let user = await USER.getUser(phone);
            //创建用户个人资料页
            console.log(user)
            let userinfo = await USER.createUserInfo(user[0].username,user[0].phone);
            if (userinfo.affectedRows == 1) {
                return user
            } else {
                return false
            }
        } else {
            return false;
        }
    }else{
       return false;
    }
}

module.exports = {
    regUser
}

