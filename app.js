var createError = require('http-errors');
var express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
let beforeLoginRouter = require('./routes/beforelogin');
let followRouter = require('./routes/follower');
const jwtVerify = require('./constrollers/jwtController')

var app = express();
var http = require('http');
var server = http.createServer(app);

app.use('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild , x-access-token');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (req.method == 'OPTIONS') {
    res.sendStatus(200);
  }
  else {
    next();
  }
});
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//静态资源
app.use(express.static(path.join(__dirname, 'public')));
//post请求
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())
app.use('/', indexRouter);
app.use('/users',jwtVerify,usersRouter);
app.use('/followers',followRouter);
app.use('/beforelogin',beforeLoginRouter);


server.listen('3000',function(){
  console.log("3000端口已经启动。")
});
