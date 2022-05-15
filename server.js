const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
//引入socket文件
const io = require('./flowerSocket')


const app = express()

//引入flowerRoom.js,这个是flowerRoom相关的路由
const flowerRoom = require('./router/api/flowerRoom')
const user = require('./router/api/user')
const flowerGame = require('./router/api/flowerGame')

//使用body-parser中间件
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//使用各个模块的路由
app.use("/api/flowerRoom", flowerRoom)
app.use("/api/user", user)
app.use("/api/flowerGame", flowerGame)


//连接数据库
mongoose.connect('mongodb://localhost:27017/flower').then(() => {
    console.log("数据库连接成功");
}).catch(() => {
    console.log('数据库连接失败');
})

//跨域设置
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});

//相当于server.listen
app.listen(3001, function () {
    console.log('服务器启动成功');

})