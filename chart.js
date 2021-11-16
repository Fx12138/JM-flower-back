const express = require('express')
var bodyParser = require('body-parser');
const app = express()
const mysql = require('mysql')
var http = require('http');
var server = http.createServer().listen(3000, () => {
    console.log('Server running ');
});//创建http服务

// socket部分
var io = require('socket.io').listen(server);

// const io = require('socket.io')(server);

var userList = []
var landlordUserList = []
var flowerUserList = []
io.sockets.on('connection', (socket) => {
    console.log('新的用户连接成功！！！')

    //用户进入聊天室
    socket.on('toChart', data => {
        let isContain = userList.find(
            (user) => user.username == data.username
        );
        if (isContain) {
            console.log("用户已存在");
        } else {
            userList.push(data);
            // console.log(data.username + '用户进入聊天室');
        }
        // socket.emit('inchart', data)
        // socket.broadcast.emit('inchart', data)
        socket.emit('inchart', userList)
        socket.broadcast.emit('inchart', userList)
    })

    //用户退出聊天室
    socket.on('outChart', data => {
        userList.map((user, index) => {
            if (user.username == data.username) {
                userList.splice(index, 1);
            }
        });
        socket.emit('outChart', data)
        socket.broadcast.emit('outChart', data)
    })

    //用户发送消息
    socket.on('send', data => {
        // console.log(data);
        socket.broadcast.emit('send', data)
        socket.emit('send', data)
    })



    //用户进入斗地主房间
    socket.on('toLandlordRoom', data => {
        let isContain = landlordUserList.find(
            (user) => user.username == data.username
        );
        if (isContain) {
            console.log("用户已存在");
        } else {
            if (landlordUserList.length < 3) {
                landlordUserList.push(data);
                var setNumber = 0
                landlordUserList.forEach((user) => {
                    user.setNumber = setNumber++
                })
                socket.emit('inLandlordRoom', landlordUserList)
                socket.broadcast.emit('inLandlordRoom', landlordUserList)
                socket.broadcast.emit('distributeSet', landlordUserList)
                socket.emit('distributeSet', landlordUserList)
                console.log(data.username + '用户进入房间');
            } else {
                socket.emit('inLandlordRoom', landlordUserList)
                socket.broadcast.emit('inLandlordRoom', landlordUserList)
            }

        }
        // socket.emit('inchart', data)
        // socket.broadcast.emit('inchart', data)
        // socket.emit('inchart', landlordUserList)
        // socket.broadcast.emit('inchart', landlordUserList)
    })

    //用户退出斗地主房间
    socket.on('outLandlordRoom', data => {
        landlordUserList.map((user, index) => {
            if (user.username == data.username) {
                landlordUserList.splice(index, 1);
            }
        });
        socket.emit('outLandlordRoom', data)
        socket.broadcast.emit('outLandlordRoom', data)
    })




    //炸金花
    //用户进入炸金花房间
    var roomInfo = {
        userNumber: 0
    }
    socket.on('toFlowerRoom', data => {
        let isContain = flowerUserList.find(
            (user) => user.username == data.username
        );
        if (isContain) {
            console.log("用户已存在");
        } else {
            if (flowerUserList.length < 6) {
                flowerUserList.push(data);

                socket.emit('inFlowerRoom', flowerUserList)
                socket.broadcast.emit('inFlowerRoom', flowerUserList)
                console.log(data.username + '用户进入房间');
            } else {
                socket.emit('inFlowerRoom', flowerUserList)
                socket.broadcast.emit('inFlowerRoom', flowerUserList)
            }

        }
    })

    //用户退出炸金花房间
    socket.on('outFlowerRoom', data => {
        flowerUserList.map((user, index) => {
            if (user.username == data.username) {
                flowerUserList.splice(index, 1);
            }
        });

        socket.emit('outFlowerRoom', data)
        socket.broadcast.emit('outFlowerRoom', data)
    })

    //发牌
    socket.on('sendPokers', data => {
        socket.emit('sendPokers', data)
        socket.broadcast.emit('sendPokers', data)
    })

    //activeUser
    socket.on('activeUser', activeUser => {
        socket.emit('activeUser', activeUser)
        socket.broadcast.emit('activeUser', activeUser)
    })

    //看牌
    socket.on('seeCard', data => {
        socket.emit('seeCard', data)
        socket.broadcast.emit('seeCard', data)
    })

    //弃牌
    socket.on('loseCard', data => {
        socket.emit('loseCard', data)
        socket.broadcast.emit('loseCard', data)
    })

    //存活玩家数量
    socket.on('aliveNumber', data => {
        socket.emit('aliveNumber', data)
        socket.broadcast.emit('aliveNumber', data)
    })

    //等待比较状态
    socket.on('chooseStatus', data => {
        socket.emit('chooseStatus', data)
        socket.broadcast.emit('chooseStatus', data)
    })

    //比牌结果
    socket.on('contrastResult', data => {
        socket.emit('contrastResult', data)
        socket.broadcast.emit('contrastResult', data)
    })

    //当前局结束
    socket.on('nowGameEnd', data => {
        socket.emit('nowGameEnd', data)
        socket.broadcast.emit('nowGameEnd', data)
    })

    //开始新的一局
    socket.on('startNewGame', data => {
        socket.emit('startNewGame', data)
        socket.broadcast.emit('startNewGame', data)
    })

    //非首局发牌
    socket.on("sendNewCards", data => {
        socket.emit('sendNewCards', data)
        socket.broadcast.emit('sendNewCards', data)
    })

    //跟注
    socket.on('follow', data => {
        socket.emit('follow', data)
        socket.broadcast.emit('follow', data)
    })

    //底分
    socket.on('bottomCoin', data => {
        socket.emit('bottomCoin', data)
        socket.broadcast.emit('bottomCoin', data)
    })

    //锅里的钱
    socket.on('coinPool', coinPool => {
        socket.emit('coinPool', coinPool)
        socket.broadcast.emit('coinPool', coinPool)
    })
});


//express数据库部分

//加入这个配置,就可以在请求对象req中得到req.body,并通过req.body来获取post请求,请求体内容
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//创建连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'stu'
})
db.connect((err) => {
    if (err) throw err;
    console.log('mysql连接成功')
})

//根据用户id查找用户
app.get('/user', (req, res) => {
    // let sql = `SELECT * FROM stu where user_id = ${}`
    db.query(sql, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            console.log('查询成功')
            res.json(data)
        }
    })
})

//发送消息时,将消息存入数据库
app.post('/saveMes', (req, res) => {
    let fromUserId = req.body.fromUserId
    let content = req.body.content
    let create_time = req.body.create_time
    let sql = `INSERT INTO message(fromUserId,content,create_time) VALUES (${fromUserId},'${content}','${create_time}');`
    db.query(sql, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            console.log('消息存储成功')
        }
    })
})

const resData = (code, data, msg) => {
    return {
        code: code || 200,
        data: data,
        msg: msg || '操作成功'
    }
}

//登录
app.post('/login', (req, res) => {
    let userForm = req.body
    let username = userForm.username
    let sql = `SELECT * FROM stu where username='${username}'`
    db.query(sql, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            if (data[0].password == userForm.pass) {
                res.json(resData(200, data[0]))
            } else {
                res.json(resData(403, null, '密码错误'))
            }
        }
    })
})

//获取消息记录
app.get('/getAllMessage', (req, res) => {
    let sql = 'SELECT * FROM message m join stu s on m.fromUserId = s.user_id order by m.create_time asc'
    db.query(sql, (err, data) => {
        if (err) {
            console.log(err)
        } else {
            console.log('查询成功')
            res.json(data)
        }
    })
})


//炸金花
//发牌
app.get('/flower/sendOtherCards', (req, res) => {


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