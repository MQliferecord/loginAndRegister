let dbConf = require('../util/dbconfig')
//增
addNote = (req,res)=>{
    let {content,dates} = req.body;
    console.log(content)
    let sql = `insert into notes(content,dates) values(?,?)`
    let sqlArr = [content,dates]
    dbConf.sqlConnect(sql,sqlArr,(err,result)=>{
        if(err){
            throw new Error(err)
        }else{
            console.log(result.insertId)
            if(result.insertId){
                let sqlans = `select * from notes where id=? `
                let sqlansArr = [result.insertId]
                dbConf.sqlConnect(sqlans,sqlansArr,(err,resans)=>{
                    if(err){
                        throw new Error(err)
                    }else{
                        if(resans.length){
                            res.send({
                                'code':200,
                                'msg':'成功添加便签',
                                'data':resans[0]
                            })
                        }
                    }
                })
            }else{
                res.send({
                    'code':400,
                    'msg':'添加便签失败'
                })
            }
        }
    })
    
}
//删
deleteNote = (req,res)=>{
    let id  = req.params.id;
    console.log("delete"+id)
    let sql = `delete from notes where id=?`
    let sqlArr = [id]
    dbConf.sqlConnect(sql,sqlArr,(err,result)=>{
        if(err){
            throw new Error(err)
        }else{
            if(result.affectedRows == 1){
                res.send({
                    'code':200,
                    'msg':'成功删除便签'
                })
            }else{
                res.send({
                    'code':400,
                    'msg':'删除便签失败',
                })
            } 
        }
    })
}
//改
updateNote = (req,res)=>{
    let {content,dates} = req.body;
    let id = req.params.id
    console.log(id)
    console.log(content)
    let sql = `update notes set content=?,dates=? where id=?`
    let sqlArr = [content,dates,id]
    dbConf.sqlConnect(sql,sqlArr,(err,result)=>{
        if(err){
            throw new Error(err)
        }else{
            if(result.affectedRows == 1){
                res.send({
                    'code':200,
                    'msg':'成功修改便签'
                })
            }else{
                res.send({
                    'code':400,
                    'msg':'修改便签失败'
                })
            }
        }
    })
}
//根据内容模糊查询
searchByContent = (req,res)=>{
    let content = req.params.content
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
    let id = req.params.id
    console.log("searchbyid"+id)
    let sql = `select * from notes where id=?`
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
    let {page,size} = req.params
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