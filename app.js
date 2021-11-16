const express = require('express')
const app = express()
const mysql = require('mysql')
var ws = require('nodejs-websocket');

//记录当前连接上的数量
var count = 0;

//只要有用户连接,就会创建一个conn对象
var server = ws.createServer(function (conn) {
    //有新的用户
    count++;
    conn.username = '用户' + count
    //告诉所有的用户,有人进来了
    broadcast(`${conn.username}进入了聊天室`)

    // 事件名称为text(读取字符串时，就叫做text)，读取客户端传来的字符串
    //接收到了客户端传来的消息
    conn.on('text', function (str) {
        //收到消息时,把消息发给所有用户
        broadcast(`${conn.username}说:${str}`)
    });

    //关闭连接时触发
    conn.on('close', () => {
        console.log('用户断开连接')
        count--;
        //告诉所有的用户,有人退出了
        broadcast(`${conn.username}离开了聊天室`)
    })
    //连接异常时触发
    conn.on('error', () => {
        console.log('用户连接异常')
    })
});

server.listen(3000)

function broadcast(msg) {
    //server.connections是一个数组，包含所有连接进来的客户端
    server.connections.forEach(function (conn) {
        //connection.sendText方法可以发送指定的内容到客户端，传入一个字符串
        //这里为遍历每一个客户端为其发送内容
        conn.sendText(msg);
    })
}



//创建连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'stu'
})
db.connect((err) => {
    if (err) throw err;
    console.log('连接成功')
})

app.get('/getStus', (req, res) => {
    let sql = 'SELECT * FROM stu'
    db.query(sql, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            console.log('查询成功')
            res.json(data)
        }
    })
})

//登录
app.post('/login', (req, res) => {
    let userForm = req.body
    console.log(userForm)
    let sql = 'SELECT * FROM stu'
    db.query(sql, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            console.log('查询成功')
            res.json(data)
        }
    })
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

app.listen(3001, () => {
    console.log('服务器已开启...')
})