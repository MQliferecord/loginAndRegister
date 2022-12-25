let dbConf = require('../util/dbconfig') 

let addNote = async(content,dates,uid)=>{
    let sql = `insert into notes(content,dates,uid) values(?,?,?)`
    let sqlArr = [content,dates,uid]
    let result = await dbConf.sqlPromise(sql,sqlArr)
    if(result.affectedRows == 1){
        return 'success'
    }else{
        return 'reject'
    }
 }
let deleteNote = async(uid)=>{
    let sql = `delete from notes where uid=?`
    let sqlArr = [uid]
    let result = await dbConf.sqlPromise(sql,sqlArr)
    if(result.affectedRows == 1){
        return 'success'
    }else{
        return 'reject'
    }
 }
let updateNote = async(content,dates,uid)=>{
    let sql = `update notes set content=?,dates=? where uid=?`
    let sqlArr = [content,dates,uid]
    let result = await dbConf.sqlPromise(sql,sqlArr)
    if(result.affectedRows == 1){
        return 'success'
    }else{
        return 'reject'
    }
 }

module.exports = {
    addNote,
    deleteNote,
    updateNote,
 }