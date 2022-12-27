let dbConf = require('../util/dbconfig')
let NOTEMETHODS = require('./noteMethods')
//增
addNote = (req,res)=>{
    let {content,dates,id} = req.body;
    console.log(content)
    NOTEMETHODS.addNote(content,dates,id).then((value)=>{
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
    let id  = req.body.id;
    NOTEMETHODS.deleteNote(id).then((value)=>{
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
    let {content,dates,id} = req.body
    NOTEMETHODS.updateNote(content,dates,id).then((value)=>{
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
    let id = req.body.id
    let sql = `select * from notes where uid=?`
    let sqlArr = [id]
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
searchByPageSize = (req,res)=>{
    let {page,size} = req.body
    let currentPage = parseInt(page)||1
    let pageSize = parseInt(size)||15
    let offset = (currentPage-1)*pageSize;
    let sql = `select * from notes limit ?,?`
    let sqlArr = [offset,pageSize]
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

module.exports = {
    addNote,
    deleteNote,
    updateNote,
    searchByContent,
    searchById,
    searchByPageSize
}