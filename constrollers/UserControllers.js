let dbConf = require('../util/dbconfig');

let fs = require('fs')
//调用阿里大鱼
const Core = require('@alicloud/pop-core')
const config = require('../util/aliconfig');
const Base64 = require('js-base64')
const jwt = require('jsonwebtoken')

const formatDateTime = require('../formatDateTime')
const rand = require('../randNum')
const LOGMETHOD = require('./loginMethods')
const USERINFO = require('./userinfoMethods');

let client = new Core(config.alicloud);
let requestOption = {
    method: 'POST',
};

validatePhoneCode = []
jwtKey = 'myjwttest'

let hasSentCode = (phone) => {
    console.log(validatePhoneCode)
    for (let item of validatePhoneCode) {
        if (phone == item.phone) {
            return true;
        }
    }
    return false;
}
let codeAndPhoneConsist = (phone, code) => {
    console.log(validatePhoneCode)
    for (let item of validatePhoneCode) {
        if (phone == item.phone && code == item.code) {
            return 'success'
        }
    }
    return 'reject'
}

//主体：本地发送验证码
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
        'msg': '发送成功',
        'data': validatePhoneCode[validatePhoneCode.length - 1]
    })
    console.log(code);
}

//主体：阿里大鱼短信服务发送验证码
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

//主体：使用手机验证码注册和登录
codeAndPhoneReg = async (req, res) => {
    let { phone, code } = req.query;
    //验证该手机号是否发送过验证码
    if (hasSentCode(phone)) {
        //验证码和手机号是否匹配
        let status = codeAndPhoneConsist(phone, code);
        if (status == 'success') {
            let user = await LOGMETHOD.loginUser(phone, phone);
            let token = jwt.sign(
                { phone },
                jwtKey,
                { expiresIn: 60 * 60 * 24 }
            )
            user[0].token = token;
            res.send({
                'code': 200,
                'msg': '登录成功',
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
loginAccess = async (req, res) => {
    let { username, email, phone, password } = req.query
    console.log(username)
    console.log(email)
    let phoneAcc = /^1[3456789]\d{9}$/
    let emailAcc = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+.([a-zA-Z0-9]{2,4})$/

    if (phoneAcc.test(phone)) {
        //手机登录
        let sql = `select * from user where phone=? and password=?`
        let sqlArr = [phone, password];
        let result = await dbConf.sqlPromise(sql, sqlArr)
        if (result == "") {
            res.send({
                'code': 400,
                'msg': '手机号或者密码出错',
                'data': []
            })
        } else {
            console.log(result[0].phone)
            result[0].userinfo = await USERINFO.getUserInfo(result[0].phone,'phone')
            console.log(result[0].userinfo)
            let token = jwt.sign(
                { phone, password },
                jwtKey,
                { expiresIn: 60 * 60 * 24 }
            )
            result[0].token = token;
            res.send({
                'code': 200,
                'msg': '登陆成功',
                'data': result[0]
            })
        }
    } else if (emailAcc.test(email)) {
        //email登录
        let sql = `select * from user where email=? and password=?`
        let sqlArr = [email, password];
        let result = await dbConf.sqlPromise(sql, sqlArr)
        if (result == "") {
            res.send({
                'code': 400,
                'msg': '邮箱或者密码出错',
                'data': []
            })
        } else {
            result[0].userinfo = await USERINFO.getUserInfo(result[0].email,'email')
            let token = jwt.sign(
                { email, password },
                jwtKey,
                { expiresIn: 60 * 60 * 24 }
            )
            result[0].token = token;
            res.send({
                'code': 200,
                'msg': '登陆成功',
                'data': result[0]
            })
        }
    } else {
        let sql = `select * from user where username=? and password=?`
        let sqlArr = [username, password];
        let result = await dbConf.sqlPromise(sql, sqlArr)
        if (result == "") {
            res.send({
                'code': 400,
                'msg': '用户名或者密码出错',
                'data': []
            })
        } else {
            result[0].userinfo = await USERINFO.getUserInfo(result[0].username,'username')
            let token = jwt.sign(
                { username, password },
                jwtKey,
                { expiresIn: 60 * 60 * 24 }
            )
            result[0].token = token;
            res.send({
                'code': 200,
                'msg': '登陆成功',
                'data': result[0]
            })
        }
    }
}


//主体：修改用户个人资料
modifUserInfoAccess = async (req, res) => {
    let { username, phone,age, sex, job, address} = req.query
    console.log(username);
    USERINFO.modifUserInfo(username, phone,age, sex, job, address).then(async (hasModifUserAttr) => {
        if (hasModifUserAttr) {
            let userinfo = await USERINFO.getUserInfo(username,'username')
            res.send({
                'code': 200,
                'data': userinfo[0]
            })
        } else {
            res.send({
                'code': 400,
                'msg': '修改属性失败'
            })
        }
    })
}

//主体：修改用户username
modifUserNameAccess = async (req, res) => {
    let { username, phone } = req.query
    USERINFO.modifUserName(username, phone).then(async (hasModifUserName) => {
        let user = await USERINFO.getUser(username)
        let userinfo = await USERINFO.getUserInfo(username,'username')
        user[0].userinfo = userinfo
        if (hasModifUserName == 'success') {
            res.send({
                'code': 200,
                'data': user[0]
            })
        } else if (hasModifUserName == 'userinfoReject') {
            res.send({
                'code': 400,
                'msg': '修改userinfo表属性失败'
            })
        } else if (hasModifUserName == 'userReject') {
            res.send({
                'code': 400,
                'msg': '修改user表属性失败'
            })
        } else {
            res.send({
                'code': 400,
                'msg': '修改属性失败'
            })
        }
    })

}

//主体：修改密码
modifPwdAccess = async (req, res) => {
    let { username, password, repassword } = req.query
    if (password != repassword) {
        res.send({
            'code': 400,
            'msg': '两次密码输入不一致'
        })
    } else {
        let sql = `select password from user where username=?`
        let sqlArr = [username]
        let oldpwdDec = await dbConf.sqlPromise(sql, sqlArr)
        console.log(oldpwdDec[0].password)
        let oldpwd = Base64.decode(oldpwdDec[0].password)
        if (oldpwd == password) {
            res.send({
                'code': 400,
                'msg': '新密码和旧密码一致'
            })
        } else {
            USERINFO.modifPassword(username, password).then(value => {
                if (value == 'success') {
                    res.send({
                        'code': 200,
                        'msg': '成功修改密码'
                    })
                } else if (value == 'userReject') {
                    res.send({
                        'code': 400,
                        'msg': '修改密码失败'
                    })
                } else {
                    res.send({
                        'code': 400,
                        'msg': '输入的密码不符合规范'
                    })
                }
            })
        }
    }

}

//主体：绑定邮箱
bindEmailAddr = async (req, res) => {
    let { username, email } = req.query;
    let emailAcc = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+.([a-zA-Z0-9]{2,4})$/
    if (emailAcc.test(email)) {
        USERINFO.bindEmail(username, email).then((value) => {
            if (value == 'success') {
                res.send({
                    'code': 200,
                    'msg': "成功绑定邮箱"
                })
            } else {
                res.send({
                    'code': 200,
                    'msg': "绑定邮箱失败"
                })
            }
        })
    } else {
        res.send({
            'code': 400,
            'msg': 'email地址不符合标准格式'
        })
    }
}

//主体：修改头像
editUserImg = (req, res) => {
    if (req.file.length === 0) {
        res.send({
            'code': 400,
            'msg': '文件为空'
        })
    } else {
        let file = req.file
        console.log(file)
        fs.renameSync('./public/uploads/' + file.filename, './public/uploads/' + file.originalname)
        res.set({
            'content-type': 'application/json;charset=utf-8'
        })
        let { username } = req.query
        let imgUrl = 'http://localhost:3000/uploads/' + file.originalname
        let sql = `update user set userpic=? where username=?`
        let sqlArr = [imgUrl, username]
        dbconfig.sqlConnect(sql, sqlArr, (err, data) => {
            if (err) {
                throw new Error(err)
            } else {
                if (data.affectedRows == 1) {
                    res.send({
                        'code': 200,
                        'msg': '添加头像成功',
                        'url': imgUrl
                    })
                } else {
                    res.send({
                        'code': 200,
                        'msg': '添加头像失败',
                    })
                }
            }
        })
    }
}

//多文件上传（后续需要使用批量上传）
mutilFileUpload = (req, res) => {
    let files = req.files;
    if (files.length === 0) {
        res.send({
            'code': 400,
            'msg': '文件为空'
        })
    } else {
        for (let i in files) {
            res.set({
                'content-type': 'application/json;charset=utf-8'
            })
            let file = files[i];
            fs.renameSync('./public/uploads/' + file.filename, './public/uploads/' + file.originalname);
            let { username } = req.query;
            let url = 'http://localhost:3000/uploads/' + file.originalname
            let sql = `insert into files(url,username,create_time) values(?,?,?)`
            let sqlArr = [url, username, formatDateTime(new Date())]
            dbConf.sqlConnect(sql, sqlArr, (err, data) => {
                if (err) {
                    throw new Error(err)
                } else {
                    if (data.affectedRows == 1) {
                        res.send({
                            'code': 200,
                            'msg': '添加文件成功',
                        })
                    } else {
                        res.send({
                            'code': 200,
                            'msg': '添加文件失败',
                        })
                    }
                }
            })
        }
    }
}

//发布视频
publishVideo = async (req, res) => {
    let { username, title, url, address, isopen } = req.query
    let sql = `insert into video(username,title,url,address,isopen,create_time) values(?,?,?,?,?,?)`
    let sqlArr = [username, title, url, address, isopen, formatDateTime(new Date())]
    let videoID = await dbConf.sqlPromise(sql, sqlArr).then(value => {
        console.log(value)
        return value.insertId
    }).catch(err => {
        throw new Error(err)
    })
    if (videoID) {
        res.send({
            'code': 200,
            'msg': '发送成功'
        })
    } else {
        res.send({
            'code': 400,
            'msg': '发送失败'
        })
    }
}

//退出登录
logoutAccess = (req, res) => {
    res.send({
        'code': 200,
        'msg': '成功退出登陆'
    })
}

module.exports = {
    sendCode,
    sendCoreCode,
    codeAndPhoneReg,
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