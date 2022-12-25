let dbConf = require('../util/dbconfig')
let NOTEMETHODS = require('./noteMethods')
//增
addNote = (req,res)=>{
    let {content,dates,_id} = req.body;
    console.log(content)
    NOTEMETHODS.addNote(content,dates,_id).then((value)=>{
        if(value == 'success'){
            res.send({
                'code':200,
                'msg':'成功增加便签'
            })
        }else{
            res.send({
                'code':400,
                'msg':'增加便签失败'
            })
        }
    })
}
//删
deleteNote = (req,res)=>{
    let _id  = req.body._id;
    NOTEMETHODS.deleteNote(_id).then((value)=>{
        if(value == 'success'){
            res.send({
                'code':200,
                'msg':'成功删除便签'
            })
        }else{
            res.send({
                'code':400,
                'msg':'删除便签失败'
            })
        }
    })
    
}
//改
updateNote = (req,res)=>{
    let {content,dates,_id} = req.body
    NOTEMETHODS.updateNote(content,dates,_id).then((value)=>{
        if(value == 'success'){
            res.send({
                'code':200,
                'msg':'成功更新便签'
            })
        }else{
            res.send({
                'code':400,
                'msg':'更新便签失败'
            })
        }
    })
}
//根据内容模糊查询
searchByContent = (req,res)=>{
    let content = req.body.content
    console.log(content)
    let sql = `select * from notes where content like ?`
    let sqlArr = ["%"+content+"%"]
    dbConf.sqlConnect(sql,sqlArr,(err,result)=>{
        if(err){
            throw new Error(err)
        }else{
            if(result.length){
                res.send({
                    'code':200,
                    'msg':'查询成功',
                    'data':result
                })
            }else{
                res.send({
                    'code':400,
                    'msg':'查询失败',
                    'data':[]
                })
            }
        }
    })  
}
//根据id精确查询
searchById = (req,res)=>{
    let _id = req.body._id
    let sql = `select * from notes where uid=?`
    let sqlArr = [_id]
    dbConf.sqlConnect(sql,sqlArr,(err,result)=>{
        if(err){
            throw new Error(err)
        }else{
            if(result.length){
                res.send({
                    'code':200,
                    'msg':'查询成功',
                    'data':result
                })
            }else{
                res.send({
                    'code':400,
                    'msg':'查询失败',
                    'data':[]
                })
            }
        }
    })  
}

//分页查询
searchbyList = (req,res)=>{

}

module.exports = {
    addNote,
    deleteNote,
    updateNote,
    searchByContent,
    searchById
}