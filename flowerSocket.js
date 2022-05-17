// socket部分
var http = require('http');
var server = http.createServer().listen(3000, () => {
    console.log('Server running ');
});//创建http服务
// var io = require('socket.io').listen(server, { cors: true });
var io = require('socket.io')(server, { origins: '*:*' });

//引入扑克相关方法
let pockerFun = require('./utils/pocker')

//引入
const FlowerRoom = require('./models/flowerRoom')
var resJson = require('./router/doc/resJson')


io.sockets.on('connection', (socket) => {


    console.log('新的用户连接成功！！！')

    //用户发快捷语音消息 user,messageId
    socket.on('sendFastMessage', data => {
        // socket.emit('sendFastMessage', resJson(data))
        // socket.broadcast.emit('sendFastMessage', resJson(data))
        io.sockets.in("room-" + data.roomId).emit('sendFastMessage', resJson(data));
    })

    //炸金花
    //用户进入炸金花房间
    socket.on('toFlowerRoom', data => {
        //建立用户名到用户socket的映射关系
        let userSocketMap = new Map();
        userSocketMap.set(data.userInfo.username, socket.id)

        //通过房间id建立一个socketroom
        io.nsps['/'].adapter.rooms["room-" + data.roomId];
        socket.join("room-" + data.roomId);

        let flowerUserList = []
        FlowerRoom.findOne({ roomId: data.roomId }).then((room) => {
            // console.log(room);
            flowerUserList = room.flowerUserList
            //Send this event to everyone in the room.
            io.sockets.in("room-" + data.roomId).emit('inFlowerRoom', resJson(flowerUserList));

            // socket.emit('inFlowerRoom', resJson(flowerUserList))
            // socket.broadcast.emit('inFlowerRoom', resJson(flowerUserList))
        })
    })

    //用户退出炸金花房间
    socket.on('outFlowerRoom', data => {

        socket.leave("room-" + data.roomId);
        io.sockets.in("room-" + data.roomId).emit('outFlowerRoom', data.userInfo);

        // socket.emit('outFlowerRoom', data.userInfo)
        // socket.broadcast.emit('outFlowerRoom', data.userInfo)
    })

    //发牌
    socket.on('sendPokers', data => {
        io.sockets.in("room-" + data.roomId).emit('sendPokers', data.pockers);

        // socket.emit('sendPokers', data)
        // socket.broadcast.emit('sendPokers', data)
    })

    //activeUser
    socket.on('activeUser', data => {
        io.sockets.in("room-" + data.roomId).emit('activeUser', data.activeUser);
        // socket.emit('activeUser', activeUser)
        // socket.broadcast.emit('activeUser', activeUser)
    })

    //看牌
    socket.on('seeCard', data => {
        io.sockets.in("room-" + data.roomId).emit('seeCard', data.activeUserId);
        // socket.emit('seeCard', data)
        // socket.broadcast.emit('seeCard', data)
    })

    //弃牌
    socket.on('loseCard', data => {
        io.sockets.in("room-" + data.roomId).emit('loseCard', data.activeUser);
        // socket.emit('loseCard', data)
        // socket.broadcast.emit('loseCard', data)
    })

    //存活玩家数量
    socket.on('aliveNumber', data => {
        io.sockets.in("room-" + data.roomId).emit('aliveNumber', data.aliveNumber);
        // socket.emit('aliveNumber', data)
        // socket.broadcast.emit('aliveNumber', data)
    })

    //等待比较状态
    socket.on('chooseStatus', data => {
        io.sockets.in("room-" + data.roomId).emit('chooseStatus', 2);
        // socket.emit('chooseStatus', data)
        // socket.broadcast.emit('chooseStatus', data)
    })

    //比牌结果
    socket.on('contrastResult', data => {
        io.sockets.in("room-" + data.roomId).emit('contrastResult', data.result);
        // socket.emit('contrastResult', data)
        // socket.broadcast.emit('contrastResult', data)
    })

    //当前局结束
    socket.on('nowGameEnd', data => {
        console.log('本局结束');

        io.sockets.in("room-" + data.roomId).emit('nowGameEnd', data.lastWinner);
        // socket.emit('nowGameEnd', data)
        // socket.broadcast.emit('nowGameEnd', data)
    })

    //开始新的一局
    socket.on('startNewGame', data => {
        socket.emit('startNewGame', data)
        socket.broadcast.emit('startNewGame', data)
    })

    //非首局发牌
    socket.on("sendNewCards", data => {
        io.sockets.in("room-" + data.roomId).emit('sendNewCards', data.flowerUserList);
    })

    //跟注
    socket.on('follow', data => {
        io.sockets.in("room-" + data.roomId).emit('follow', data.coinNum);
        // socket.emit('follow', data)
        // socket.broadcast.emit('follow', data)
    })

    //底分
    socket.on('bottomCoin', data => {
        console.log(data.bottomCoin);

        // io.sockets.in("room-" + data.roomId).emit('bottomCoin', data.bottomCoin);
        // socket.emit('bottomCoin', data)
        // socket.broadcast.emit('bottomCoin', data)
    })

    //锅里的钱
    socket.on('coinPool', data => {
        io.sockets.in("room-" + data.roomId).emit('coinPool', data.coinPool);
        // socket.emit('coinPool', coinPool)
        // socket.broadcast.emit('coinPool', coinPool)
    })
});

module.exports = io