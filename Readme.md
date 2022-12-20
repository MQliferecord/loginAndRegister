### 你好，这是一个使用Nodejs+Express+Mysql实现的一个简单的后台登陆注册文件上传接口

功能有：

- 用户登录（手机号/邮箱/用户名+密码）

- 用户注册（手机号+验证码）可通过开通阿里云的大鱼短信服务实现发送验证码，在代码中替换`constrollers/UserControllers/sendCoreCode()`和`util/aliconfig.js`内的参数成阿里大鱼申请的参数就可以。这里我写的参数是杜撰的。

```javascript
//util/aliconfig.js
module.exports = {
    alicloud:{
        //以下需要填写在阿里云申请的相关id和key
        "accessKeyId": '<your-access-key-id>',
        "accessKeySecret": '<your-access-key-secret>',
        // securityToken: '<your-sts-token>', // use STS Token
        "endpoint": 'https://dysmsapi.aliyuncs.com',
        "apiVersion": '2017-05-25'
    }
}
//constrollers/UserControllers/sendCoreCode()
var params = {
        "Region-Id": "cn-hangzhou",
        "PhoneNumbers": phone,
        "SignName": "测试App",
        "TemplateCode": "SMS_130000000",
        "TemplateCode": JSON.stringify({ "code": code })
    };
```

- JWT鉴权登录

- BASE64密码加密

- 修改用户的个人资料

- 单文件上传

- 多文件上传
