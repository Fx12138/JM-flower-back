// socket部分
var http = require('http');
var server = http.createServer().listen(3000, () => {
    console.log('Server running ');
});//创建http服务
var io = require('socket.io').listen(server, { cors: true });

//引入
const FlowerRoom = require('./models/flowerRoom')
var resJson = require('./router/doc/resJson')


io.sockets.on('connection', (socket) => {
    console.log('新的用户连接成功！！！')

    //炸金花
    //用户进入炸金花房间
    socket.on('toFlowerRoom', data => {
        let flowerUserList = []
        FlowerRoom.findOne({ roomId: data.roomId }).then((room) => {
            // console.log(room);
            flowerUserList = room.flowerUserList
            socket.emit('inFlowerRoom', resJson(flowerUserList))
            socket.broadcast.emit('inFlowerRoom', resJson(flowerUserList))
        })
    })

    //用户退出炸金花房间
    socket.on('outFlowerRoom', data => {
        // flowerUserList.map((user, index) => {
        //     if (user.username == data.username) {
        //         flowerUserList.splice(index, 1);
        //     }
        // });

        socket.emit('outFlowerRoom', data.userInfo)
        socket.broadcast.emit('outFlowerRoom', data.userInfo)
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

module.exports = io