//模拟发送验证码接口
let dbConf = require('../util/dbconfig');
let fs = require('fs')
//调用阿里大鱼
const Core = require('@alicloud/pop-core')
const config = require('../util/aliconfig');
const e = require('express');
let client = new Core(config.alicloud);
let requestOption = {
    method: 'POST',
};
function rand(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

validatePhoneCode = []

//是否已经发送验证码
let hasSentCode = (phone) => {
    for (let item of validatePhoneCode) {
        if (phone == item.phone) {
            return true;
        }
    }
    return false;
}
//验证码和手机号是否匹配
let findCodeAndPhone = (phone, code) => {
    for (let item of validatePhoneCode) {
        if (phone == item.phone && code == item.code) {
            return 'login'
        }
    }
    return 'error'
}
//检测是否第一次使用该手机号登录
let phoneLoginBind = async (phone) => {
    let sql = `select * from user where username=? or phone=?`;
    let sqlArr = [phone, phone];
    let result = await dbConf.sqlPromise(sql, sqlArr);
    if (result.length) {
        result[0].userinfo = await getUserInfo(result[0].username)
        return result
    } else {
        //第一次登录需要mysql注册信息并且绑定表格
        //用户注册
        let result = await regUser(phone)
        //获取用户个人资料
        result[0].userinfo = await getUserInfo(result[0].username)
        return result
    }
}

//用户注册
let regUser = async (phone) => {
    //检测用户是否已经注册
    let userpic = 'images'
    let sql = `insert into user(username,userpic,phone,create_time) value(?,?,?,?)`;
    let sqlArr = [phone, userpic, phone, 2004];
    let result = await dbConf.sqlPromise(sql, sqlArr);
    //用户成功注册，返回1；用户已经存在不需要注册，返回-1
    if (result.affectedRows == 1) {
        //获取用户
        let user = await getUser(phone);
        //创建用户个人资料页
        console.log(user)
        let userinfo = await createUserInfo(user[0].username);
        if (userinfo.affectedRows == 1) {
            return user
        } else {
            return false
        }
    } else {
        return false;
    }
}

//获取用户注册时填写的信息
let getUser = (username) => {
    let sql = `select * from user where username=? or phone=?`;
    let sqlArr = [username, username]
    return dbConf.sqlPromise(sql, sqlArr)
}
//创建用户个人资料页
let createUserInfo = (username) => {
    let sql = `insert into userinfo(username,age,sex,job,address,birthday) value(?,?,?,?,?,?)`;
    let sqlArr = [username, 18, 'female', 'writer','',2004]
    return dbConf.sqlPromise(sql, sqlArr);
}

//获取用户个人资料
let getUserInfo = (username) => {
    let sql = `select age,sex,job,address,birthday from userinfo where username=?`;
    let sqlArr = [username]
    return dbConf.sqlPromise(sql, sqlArr);
}

//修改用户个人资料(不包括username)
let modifUserInfo = async (username,age,sex,job,address,birthday)=>{
    let hasUserInfo = await getUserInfo(username)
   if(hasUserInfo.length){
        let sql = `update userinfo set age=?,sex=?,job=?,address=?,birthday=? where username=?`
        let sqlArr = [age,sex,job,address,birthday,username]
        let result = await dbConf.sqlPromise(sql,sqlArr)
        if(result.affectedRows == 1){
            let user = await getUser(username)
            let userinfo = await getUserInfo(username);
            user[0].userinfo = userinfo
            return user
        }else{
            return false
        }
   }else{
        let result = await createUserInfo(username) 
        if(result.affectedRows == 1){
            let user = await getUser(username)
            let userinfo = await getUserInfo(username);
            user[0].userinfo = userinfo
            return user
        }else{
            return false
        }

   } 
}

//修改用户username
let modifUserName = async (username,phone,birthday)=>{
    let sql = `update user set username=? where phone=?`
    let sqlArr = [username,phone]
    let result = await dbConf.sqlPromise(sql,sqlArr)
    /**
     * 后续需要修改userinfo的表格，添加phone属性
     * let sql = `update userinfo set username=? where phone=?`
     * 这里为了先不影响后续的功能实现，先使用birthday修改userinfo里的username
     * */
    let sqlUserInfo = `update userinfo set username=? where birthday=?`
    let sqlArrUserInfo = [username,birthday] 
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

//修改密码
let modifPassword = async(username,password)=>{
    let sqlpwd = `update user set password=? where username=?`
    let sqlArrPwd = [password,username]
    let result = await dbConf.sqlPromise(sqlpwd,sqlArrPwd)
    if(result.affectedRows == 1){
        return 'success'
    }else{
        return 'reject'
    }
}

//绑定邮箱
let bindEmail = async(username,email)=>{
    let sql = `update user set email=? where username=?`;
    let sqlArr = [email,username]
    let result = await dbConf.sqlPromise(sql,sqlArr);
    if(result.affectedRows == 1){
        return 'success'
    }else{
        return 'reject'
    }
}

//主体：发送验证码
sendCode = (req, res) => {
    let phone = req.query.phone;
    if (hasSentCode(phone)) {
        res.send({
            'code': 400,
            'msg': '已经发送过验证码,稍后再发'
        })
    }
    let code = rand(1000, 9999);
    validatePhoneCode.push({
        'phone': phone,
        'code': code
    })
    console.log(validatePhoneCode);
    res.send({
        'code': 200,
        'msg': '发送成功'
    })
    console.log(code);
}

//主体：阿里大鱼短信服务将code发送到手机号
sendCoreCode = (req, res) => {
    let phone = req.query.phone;
    let code = rand(1000, 9999);
    //以下都是假数据，实际数据以阿里云openAPI为准
    var params = {
        "Region-Id": "cn-hangzhou",
        "PhoneNumbers": phone,
        "SignName": "测试App",
        "TemplateCode": "SMS_130000000",
        "TemplateCode": JSON.stringify({ "code": code })
    };
    client.request('SendSms', params, requestOption).then((result) => {
        console.log(result);
        if (result.Code == 'OK') {
            res.send({
                "code": 200,
                "msg": '发送成功'
            })
            validatePhoneCode.push({
                'phone': phone,
                'code': code
            })
            console.log(code)
        } else {
            res.send({
                "code": 400,
                "msg": '发送失败'
            })
        }
    })
}

//主体：使用验证码登录
codePhoneLogin = async (req, res) => {
    let { phone, code } = req.query;
    //验证该手机号是否发送过验证码
    if (hasSentCode(phone)) {
        //验证码和手机号是否匹配
        let status = findCodeAndPhone(phone, code);
        if (status == 'login') {
            //登陆成功
            let user = await phoneLoginBind(phone);
            res.send({
                'code': 200,
                'msg': '登陆成功',
                'data': user[0]
            })

        } else if (status == 'error') {
            res.send({
                'code': 200,
                'msg': '验证码和手机号不匹配'
            })
        }
    } else {
        res.send({
            'code': 400,
            'msg': '未发送验证码'
        })
    }
}

//主体：用户名/手机号/邮箱登录
loginAccess = (req, res) => {
    let { username, password, email, phone } = req.query
    let phoneAcc = /^1[3456789]\d{9}$/
    let emailAcc = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+.([a-zA-Z0-9]{2,4})$/
    if (phoneAcc.test(phone)) {
        let sql = `select * from user where phone=? and password=?`
        let sqlArr = [phone, password];
        let callBack = async (err, data) => {
            if (err) {
                console.log(err)
                res.send({
                    'code': 400,
                    'msg': '出错了'
                })
            } else if (data == "") {
                res.send({
                    'code': 400,
                    'msg': '手机号或者密码出错',
                    'data': []
                })
            } else {
                data[0].userinfo = await getUserInfo(data[0].phone)
                res.send({
                    'code': 200,
                    'msg': '登陆成功',
                    'data': data[0]
                })
            }
        }
        let result = dbConf.sqlConnect(sql, sqlArr, callBack);
        return result;
    }else if(emailAcc.test(email)){
        let sql = `select * from user where email=? and password=?`
        let sqlArr = [email, password];
        let callBack = async (err, data) => {
            if (err) {
                console.log(err)
                res.send({
                    'code': 400,
                    'msg': '出错了'
                })
            } else if (data == "") {
                res.send({
                    'code': 400,
                    'msg': '邮箱或者密码出错',
                    'data': []
                })
            } else {
                data[0].userinfo = await getUserInfo(data[0].email)
                res.send({
                    'code': 200,
                    'msg': '登陆成功',
                    'data': data[0]
                })
            }
        }
        let result = dbConf.sqlConnect(sql, sqlArr, callBack);
        return result;
    }else{
        let sql = `select * from user where username=? and password=?`
        let sqlArr = [username, password];
        let callBack = async (err, data) => {
            if (err) {
                console.log(err)
                res.send({
                    'code': 400,
                    'msg': '出错了'
                })
            } else if (data == "") {
                res.send({
                    'code': 400,
                    'msg': '用户名或者密码出错',
                    'data': []
                })
            } else {
                data[0].userinfo = await getUserInfo(data[0].username)
                res.send({
                    'code': 200,
                    'msg': '登陆成功',
                    'data': data[0]
                })
            }
        }
        let result = dbConf.sqlConnect(sql, sqlArr, callBack);
        return result;
    }
}

//主体：修改用户个人资料
modifUserInfoAccess = async (req,res)=>{
    let {username,age,sex,job,address,birthday} = req.query
    modifUserInfo(username,age,sex,job,address,birthday).then(async(hasModifUserAttr)=>{
        if(hasModifUserAttr){
            let userinfo = await getUserInfo(username)
            res.send({
                'code':200,
                'data':userinfo[0]
            })
        }else{
            res.send({
                'code':400,
                'msg':'修改属性失败'
            })
        }
    })
}

//主体：修改用户username
modifUserNameAccess = async (req,res)=>{
    let {username,phone,birthday} = req.query
    modifUserName(username,phone,birthday).then(async(hasModifUserName)=>{
        let user = await getUser(username)
        let userinfo = await getUserInfo(username)
        user[0].userinfo = userinfo
        if(hasModifUserName == 'success'){
            res.send({
                'code':200,
                'data':user[0]
            })
        }else if(hasModifUserName == 'userinfoReject'){
            res.send({
                'code':400,
                'msg':'修改userinfo表属性失败'
            })
        }else if(hasModifUserName == 'userReject'){
            res.send({
                'code':400,
                'msg':'修改user表属性失败'
            })
        }else{
            res.send({
                'code':400,
                'msg':'修改属性失败'
            })
        }
    })
    
}

//主体：修改密码（后续需要添加MD5加密）
modifPwdAccess = async(req,res)=>{
    let{username,password,repassword} = req.query
    if(password != repassword){
        res.send({
            'code':400,
            'msg':'两次密码输入不一致'
        })
    }else{
        let sql = `select password from user where username=?`
        let sqlArr = [username]
        let oldpwd = await dbConf.sqlPromise(sql,sqlArr)
        if(oldpwd[0] == password){
            res.send({
                'code':400,
                'msg':'新密码和旧密码一致'
            })
        }else{
            modifPassword(username,password).then(value=>{
                if(value == 'success'){
                    res.send({
                        'code':200,
                        'msg':'成功修改密码'
                    })
                }else{
                    res.send({
                        'code':400,
                        'msg':'修改密码失败'
                    })
                }
            })
        }
    }

}

//主体：绑定邮箱
bindEmailAddr = async(req,res)=>{
    let {username,email} = req.query;
    let emailAcc = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+.([a-zA-Z0-9]{2,4})$/
    if(emailAcc.test(email)){
        bindEmail(username,email).then((value)=>{
        if(value == 'success'){
            res.send({
                'code':200,
                'msg':"成功绑定邮箱"
            })
        }else{
            res.send({
                'code':200,
                'msg':"绑定邮箱失败"
            })
        }})
    }else{
        res.send({
            'code':400,
            'msg':'email地址不符合标准格式'
        })
    }
}

//主体：修改头像
editUserImg = (req,res)=>{
    if(req.file.length === 0){
        res.send({
            'code':400,
            'msg':'文件为空'
        })
    }else{
        let file = req.file
        console.log(file)
        fs.renameSync('./public/uploads/'+file.filename,'./public/uploads/'+file.originalname)
        res.set({
            'content-type':'application/json;charset=utf-8'
        })
        let {username} = req.query
        let imgUrl = 'http://localhost:3000/uploads/'+file.originalname
        let sql = `update user set userpic=? where username=?`
        let sqlArr = [imgUrl,username]
        dbconfig.sqlConnect(sql,sqlArr,(err,data)=>{
            if(err){
                throw new Error(err)
            }else{
                if(data.affectedRows==1){
                    res.send({
                        'code':200,
                        'msg':'添加头像成功',
                        'url':imgUrl
                    })
                }else{
                    res.send({
                        'code':200,
                        'msg':'添加头像失败',
                    })
                }
            }
        })
    }
}

//多文件上传（后续需要使用批量上传）
mutilFileUpload = (req,res)=>{
    let files = req.files;
    if(files.length === 0){
        res.send({
            'code':400,
            'msg':'文件为空'
        })
    }else{
        for(let i in files){
            res.set({
                'content-type':'application/json;charset=utf-8'
            })
            let file = files[i];
            fs.renameSync('./public/uploads/'+file.filename,'./public/uploads/'+file.originalname);
            let {username} = req.query;
            let url = 'http://localhost:3000/uploads/'+file.originalname
            let sql = `insert into files(url,username,create_time) values(?,?,?)`
            let sqlArr = [url,username,2004]
            dbConf.sqlConnect(sql,sqlArr,(err,data)=>{
                if(err){
                    throw new Error(err)
                }else{
                    if(data.affectedRows==1){
                        res.send({
                            'code':200,
                            'msg':'添加文件成功',
                        })
                    }else{
                        res.send({
                            'code':200,
                            'msg':'添加文件失败',
                        })
                    }
                }
            })
        }
    }
}

//发布视频
publishVideo = async(req,res)=>{
    let {username,title,url,address,isopen} = req.query
    let sql = `insert into video(username,title,url,address,isopen,create_time) values(?,?,?,?,?,?)`
    let sqlArr = [username,title,url,address,isopen,2022]
    let videoID = await dbConf.sqlPromise(sql,sqlArr).then(value=>{
        console.log(value)
        return value.insertId
    }).catch(err=>{
        throw new Error(err)
    })
    if(videoID){
        res.send({
            'code':200,
            'msg':'发送成功'
        })
    }else{
        res.send({
            'code':400,
            'msg':'发送失败'
        })
    }
}

//退出登录（后续添加JWT鉴权）
logoutAccess = (req,res)=>{
    res.send({
        'code':200,
        'msg':'成功退出登陆'
    })
}

module.exports = {
    sendCode,
    sendCoreCode,
    codePhoneLogin,
    loginAccess,
    modifUserInfoAccess,
    modifUserNameAccess,
    modifPwdAccess,
    bindEmailAddr,
    editUserImg,
    mutilFileUpload,
    publishVideo,
    logoutAccess
}