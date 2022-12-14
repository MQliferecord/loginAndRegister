//获取分类
let dbConf = require('../util/dbconfig')
getCate = (req, res) => {
    let sql = "select * from cate";
    let sqlArr = [];
    let callback = (err, data) => {
        if (err) {
            console.log("连接出错了")
        } else {
            res.send({
                'list': data
            })
        }
    }
    dbConf.sqlConnect(sql, sqlArr, callback);
}
//获取指定分类的文章列表
getPostCate = (req, res) => {
    let { id } = req.query;
    let sql = `select * from post where cate_id =?`;
    let sqlArr = [id];
    let callback = (err, data) => {
        if (err) {
            console.log("连接出错了")
        } else {
            res.send({
                'list': data
            })
        }
    }
    dbConf.sqlConnect(sql, sqlArr, callback);
}
module.exports = {
    getCate,
    getPostCate
}