var express = require('express')
var router = require('./router/api/flowerRoom')


//创建服务器应用程序
//也就是原来的 http.createServer
var app = express()

app.use(router)

//静态资源
//本来情况下目录下的文件和静态资源是不能被访问的
//通过下面的方式可以通过访问http://localhost:3000/public/aaa.html访问到
app.use('/public', express.static('./public'))

//相当于server.listen
app.listen(3000, function () {
    console.log('服务器启动成功');

})