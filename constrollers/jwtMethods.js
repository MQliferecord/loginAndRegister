const jwt = require('jsonwebtoken') 
jwtKey = 'myjwttest'

function jwtVerify(req,res,next){
    let token = req.body.token|| req.query.token||req.headers['x-access-token'];
    if(token){
        jwt.verify(token,jwtKey,(err,data)=>{
            if(err){
                throw new Error(err)
            }else{
                req.data = data;
                console.log(data)
                next()
            }
        })
    }else{
        res.send({
            'code':400,
            'msg':'没有token'
        })
    }
}
module.exports = jwtVerify