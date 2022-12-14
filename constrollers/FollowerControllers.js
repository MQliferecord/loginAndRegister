let dbConf = require('../util/dbconfig');

//查询用户
let checkFollow = async (user_id,follow_id)=>{
    let sql = `select * from follower where user_id=? and follow_id=?`;
    let sqlArr = [user_id,follow_id]
    let result = await dbConf.sqlPromise(sql,sqlArr)
    if(result.length){
        return true
    }else{
        return false
    }
}

follow = (req,res)=>{
    let {user_id,follow_id} = req.query
    //检查用户是否已经关注
    checkFollow(user_id,follow_id).then(async(hasFollower)=>{
        if(!hasFollower){
            if(user_id == follow_id){
                res.send({
                    'code':400,
                    'msg':'不能关注自己'
                })
            }else{
                let sql = `insert into follower(user_id,follow_id,create_time) values(?,?,?)`
                let sqlArr = [user_id,follow_id,2022]
                let result = await dbConf.sqlPromise(sql,sqlArr)
                if(result.affectedRows == 1){
                    res.send({
                        'code':200,
                        'msg':'关注成功'
                    })
                }else{
                    res.send({
                        'code':400,
                        'msg':'关注失败'
                    })
                }
            }
        }else{
            res.send({
                'code':400,
                'msg':'不能重复关注'
            })
        }
    })
}
module.exports = {
    follow
}