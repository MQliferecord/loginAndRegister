const mysql = require('mysql');
module.exports = {
    config:{
        host:'localhost',
        port:'3306',
        user:'root',
        password:'111111',
        database:'apiprac'
    },
    //连接数据库，使用连接池
    //连接池的对象
    sqlConnect:function(sql,sqlArr,callback){
        let pool = mysql.createPool(this.config);
        pool.getConnection((err,conn)=>{
            if(err){
                console.log('连接失败')
                return;
            }
            //事件驱动回调
            conn.query(sql,sqlArr,callback);
            //释放连接
            conn.release();
        })
    },
    //异步数据promise回调
    sqlPromise:async function(sql,sqlArr){
        return new Promise((resolve,reject)=>{
            let pool = mysql.createPool(this.config);
            pool.getConnection((err,conn)=>{
                if(err){
                    reject(err)
                }else{
                    conn.query(sql,sqlArr,(err,data)=>{
                        if(err){
                            reject(err)
                        }else{
                            resolve(data)
                        }
                    });
                    conn.release();
                }
            })
        }).catch((err)=>{
            console.log(err)
        })
    }
}