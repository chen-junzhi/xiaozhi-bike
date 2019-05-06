var express = require("express");
var bodyParser = require("body-parser");

//创建app应用，相当于 ==> Node.js Http.createServer();
var app = express();

//定义一下返回数据的格式
var resData = {};
app.use(function (req, res, next){
  resData = {
    code: -1,
    msg: ""
  };
  next();
});

app.get("/api/verifyCode", function(req, res){
  resData = {
    code: 1,
    msg: Math.ceil(Math.random()*8999 + 1000)
  };
  res.send(resData);
});

app.listen(80, '0.0.0.0', function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("服务器启动成功,端口80");
  }
});