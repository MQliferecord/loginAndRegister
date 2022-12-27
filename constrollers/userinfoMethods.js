let dbConf = require('../util/dbconfig');
const formatDateTime = require('../formatDateTime')
const Base64 = require('js-base64')

let getUser = (username) => {
    let sql = `select * from user where username=? or phone=?`;
    let sqlArr = [username, username]
    return dbConf.sqlPromise(sql, sqlArr)
}
let createUserInfo = (username,phone) => {
    let sql = `insert into userinfo(username,phone,email,age,sex,job,address,birthday) value(?,?,?,?,?,?,?,?)`;
    let sqlArr = [username,phone,'',0,'', '','',formatDateTime(new Date())]
    return dbConf.sqlPromise(sql, sqlArr);
}
let getUserInfo = (checkAttrVal,checkAttr) => {
    console.log(checkAttr)
    let sql = `select username,phone,email,age,sex,job,address,birthday from userinfo where ${checkAttr}=?`;
    let sqlArr = [checkAttrVal]
    return dbConf.sqlPromise(sql, sqlArr);
}
let modifUserInfo = async (username,phone,age,sex,job,address)=>{
    console.log(username)
    let hasUserInfo = await getUserInfo(username,'username')
   if(hasUserInfo.length){
        let sql = `update userinfo set age=?,sex=?,job=?,address=? where username=?`
        let sqlArr = [age,sex,job,address,username]
        let result = await dbConf.sqlPromise(sql,sqlArr)
        if(result.affectedRows == 1){
            let user = await getUser(username)
            let userinfo = await getUserInfo(username,'username');
            user[0].userinfo = userinfo
            return user
        }else{
            return false
        }
   }else{
        let result = await createUserInfo(username,phone) 
        if(result.affectedRows == 1){
            let user = await getUser(username)
            let userinfo = await getUserInfo(username,'username');
            user[0].userinfo = userinfo
            return user
        }else{
            return false
        }

   } 
}
let modifUserName = async (username,phone)=>{
    let sql = `update user set username=? where phone=?`
    let sqlArr = [username,phone]
    let result = await dbConf.sqlPromise(sql,sqlArr)
    let sqlUserInfo = `update userinfo set username=? where phone=?`
    let sqlArrUserInfo = [username,phone] 
    let resultUserInfo = await dbConf.sqlPromise(sqlUserInfo,sqlArrUserInfo)
    if(result.affectedRows == 1 && resultUserInfo.affectedRows == 1){
        return 'success'
    }else if(result.affectedRows != 1 && resultUserInfo.affectedRows == 1){
        return 'userReject'
    }else if(result.affectedRows == 1 && resultUserInfo.affectedRows != 1){
        return 'userinfoReject'
    }else{
        return 'bothReject'
    }
}

let modifPassword = async(username,password)=>{
    let pwdAcc = /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{8,16}$/
    if(pwdAcc.test(password)){
        //BASE64加密
        Base64.encode(password);
        
        let sqlpwd = `update user set password=? where username=?`
        let sqlArrPwd = [password,username]
        let result = await dbConf.sqlPromise(sqlpwd,sqlArrPwd)
        if(result.affectedRows == 1){
            return 'success'
        }else{
            return 'userReject'
        }
    }else{
        return 'pwdReject'
    }
    
}
let bindEmail = async(username,email)=>{
    let sql = `update user set email=? where username=?`;
    let sqlArr = [email,username]
    let result = await dbConf.sqlPromise(sql,sqlArr);
    let sqlUserInfo = `update userinfo set email=? where username=?`
    let sqlArrUserInfo = [email,username] 
    let resultUserInfo = await dbConf.sqlPromise(sqlUserInfo,sqlArrUserInfo)
    if(result.affectedRows == 1&&resultUserInfo.affectedRows == 1){
        return 'success'
    }else{
        return 'reject'
    }
}

module.exports = {
    getUser,
    createUserInfo,
    getUserInfo,
    modifUserInfo,
    modifUserName,
    modifPassword,
    bindEmail
}