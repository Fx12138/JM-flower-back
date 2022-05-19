// socket部分
var http = require('http');
var server = http.createServer().listen(3000, () => {
    console.log('Server running ');
});//创建http服务
// var io = require('socket.io').listen(server, { cors: true });
var io = require('socket.io')(server, { origins: '*:*' });

//引入扑克相关方法
let pockerFun = require('./utils/pocker')
let judgeFun = require('./utils/judge')
let randomNum = require('./utils/otherUtils')
//引入
const FlowerRoom = require('./models/flowerRoom')
var resJson = require('./router/doc/resJson');
//建立用户名到用户socket的映射关系
let userSocketMap = new Map();


io.sockets.on('connection', (socket) => {


    console.log('新的用户连接成功！！！')



    //用户发快捷语音消息 user,messageId
    socket.on('sendFastMessage', data => {
        io.sockets.in("room-" + data.roomId).emit('sendFastMessage', resJson(data));
    })

    //炸金花
    //用户进入炸金花房间
    socket.on('toFlowerRoom', data => {

        userSocketMap.set(data.userInfo.username, socket.id)

        //通过房间id建立一个socketroom
        io.nsps['/'].adapter.rooms["room-" + data.roomId];
        socket.join("room-" + data.roomId);

        let flowerUserList = []
        FlowerRoom.findOne({ roomId: data.roomId }).then((room) => {
            flowerUserList = room.flowerUserList
            io.sockets.in("room-" + data.roomId).emit('inFlowerRoom', resJson(flowerUserList));

        })
    })

    //用户退出炸金花房间
    socket.on('outFlowerRoom', data => {

        socket.leave("room-" + data.roomId);
        io.sockets.in("room-" + data.roomId).emit('outFlowerRoom', data.userInfo);
    })

    //发牌
    socket.on('sendPokers', data => {

        let pockers = pockerFun.creatPoker()
        let userNumber = null;
        let flowerUserList = [];
        let roomInfo = {};
        FlowerRoom.findOne({ roomId: data.roomId }).then((room) => {
            userNumber = room.flowerUserList.length;
            flowerUserList = room.flowerUserList;
            roomInfo = room.roomInfo;

            //发牌
            let lastCards = 52;
            lastCards = lastCards - userNumber * 3;
            while (pockers.length > lastCards) {
                //只要牌堆的牌大于应该剩余牌数，玩家继续摸牌
                for (let i = 0; i < userNumber; i++) {
                    //玩家轮流摸牌
                    flowerUserList[i].card.push(pockers.pop());
                }
            }
            for (let i = 0; i < flowerUserList.length; i++) {
                flowerUserList[i].coin = -1
                flowerUserList[i].isDown = -1
                flowerUserList[i].cardType = judgeFun.judge(flowerUserList[i].card)
                flowerUserList[i].liveStatus = 1
            }
            //修改房间信息
            let activeUserId = randomNum(0, userNumber - 1);
            roomInfo.activeUser.id = activeUserId;
            roomInfo.activeUser.username = flowerUserList.filter((user) => {
                return user.id == activeUserId;
            })[0].username;
            roomInfo.status = 1;
            roomInfo.gamesNumber = 1;
            roomInfo.bottomCoin = 1;
            roomInfo.coinPool = userNumber;
            roomInfo.userNumber = userNumber;
            roomInfo.aliveNumber = userNumber;

            room.roomInfo = roomInfo
            room.flowerUserList = flowerUserList


            // 更新数据的条件查询
            var wherestr = { 'roomId': data.roomId };
            // flowerUserList = JSON.parse(flowerUserList)

            // 执行更新数据
            var updatestr = { 'flowerUserList': flowerUserList, 'roomInfo': roomInfo };

            FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
                io.sockets.in("room-" + data.roomId).emit('sendPokers', room);
            })
        })
    })


    //看牌
    socket.on('seeCard', data => {
        let roomInfo = {};
        let flowerUserList = []
        let activeUserId = null;
        let activeUser = null;
        FlowerRoom.findOne({ roomId: data.roomId }).then((room) => {
            userNumber = room.flowerUserList.length;
            flowerUserList = room.flowerUserList;
            roomInfo = room.roomInfo;
            bottomCoin = roomInfo.bottomCoin;
            activeUserId = roomInfo.activeUser.id
            activeUser = flowerUserList.filter((user) => {
                return user.id == activeUserId
            })[0]

            activeUser.cardStatus = 1
            room.roomInfo = roomInfo
            room.flowerUserList = flowerUserList

            // 更新数据的条件查询
            var wherestr = { 'roomId': data.roomId };
            // 执行更新数据
            var updatestr = { 'flowerUserList': flowerUserList, 'roomInfo': roomInfo };

            FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
                io.sockets.in("room-" + data.roomId).emit('seeCard', room);
            })
        })
    })

    //弃牌
    socket.on('loseCard', data => {
        let roomInfo = {};
        let flowerUserList = []
        let activeUserId = null;
        let activeUser = null;
        FlowerRoom.findOne({ roomId: data.roomId }).then((room) => {
            userNumber = room.flowerUserList.length;
            flowerUserList = room.flowerUserList;
            roomInfo = room.roomInfo;
            activeUserId = roomInfo.activeUser.id
            activeUser = flowerUserList.filter((user) => {
                return user.id == activeUserId
            })[0]
            //将当前活跃用户状态置为0
            flowerUserList.filter((user) => {
                return user.id == activeUserId
            })[0].liveStatus = 0

            roomInfo.aliveNumber -= 1
            if (roomInfo.aliveNumber > 1) {
                //活着的玩家大于1,游戏继续
                //得出下一家
                let newActiveUserId = (activeUserId + 1) % userNumber
                while (!flowerUserList.filter(user => {
                    return user.id == newActiveUserId
                })[0].liveStatus) {
                    newActiveUserId = (newActiveUserId + 1) % userNumber
                }
                roomInfo.activeUser.id = newActiveUserId
                roomInfo.activeUser.username = flowerUserList.filter(user => {
                    return user.id == newActiveUserId
                })[0].username

                //广播游戏状态,发送弃牌者的loseId使其存活状态改为0,
                room.roomInfo = roomInfo
                room.flowerUserList = flowerUserList

                // 更新数据的条件查询
                var wherestr = { 'roomId': data.roomId };
                // 执行更新数据
                var updatestr = { 'flowerUserList': flowerUserList, 'roomInfo': roomInfo };

                FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
                    io.sockets.in("room-" + data.roomId).emit('loseCard', { 'loseId': activeUserId, room });
                })
            } else {
                //本局游戏结束
                //求得赢家id
                flowerUserList.forEach((user) => {
                    if (user.liveStatus) {
                        //赢家
                        roomInfo.lastWinner.id = user.id; //设为最近的赢家
                        roomInfo.lastWinner.username = user.username;
                        user.coin = roomInfo.coinPool
                    }
                });
                roomInfo.coinPool = 0; //锅里的钱置零

                room.roomInfo = roomInfo
                room.flowerUserList = flowerUserList

                // 更新数据的条件查询
                var wherestr = { 'roomId': data.roomId };
                // 执行更新数据
                var updatestr = { 'flowerUserList': flowerUserList, 'roomInfo': roomInfo };

                FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {

                    io.sockets.in("room-" + data.roomId).emit('nowGameEnd', { room, 'loser': activeUser });
                })

                //五秒后开始下一局
                setTimeout(() => {
                    let newRoom = beginNewGame(room)
                    room.roomInfo = newRoom.roomInfo
                    room.flowerUserList = newRoom.flowerUserList

                    // 更新数据的条件查询
                    var wherestr = { 'roomId': data.roomId };
                    // 执行更新数据
                    var updatestr = { 'flowerUserList': room.flowerUserList, 'roomInfo': room.roomInfo };
                    FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
                        io.sockets.in("room-" + data.roomId).emit('sendNewCards', room);
                    })
                }, 5000);

            }

        })
    })


    //比牌结果
    socket.on('contrastResult', data => {

        let roomInfo = {};
        let flowerUserList = []
        let activeUserId = null;
        let userNumber = null;
        FlowerRoom.findOne({ roomId: data.roomId }).then((room) => {
            userNumber = room.flowerUserList.length;
            flowerUserList = room.flowerUserList;
            roomInfo = room.roomInfo;
            activeUserId = roomInfo.activeUser.id

            let result = null;
            //发起比牌用户
            let contrastinger = data.contrastinger;
            //被比较用户
            let contrasteder = data.contrasteder;

            //不管谁的牌大,发起比牌的都要减钱
            flowerUserList.filter(user => {
                return user.username == contrastinger.username
            })[0].coin -= roomInfo.bottomCoin * 2

            //不管谁的牌大,锅里都要加钱
            roomInfo.coinPool += roomInfo.bottomCoin * 2;
            if (contrastinger.cardType < contrasteder.cardType) {
                //用户1的牌大
                result = true;
            } else if (contrastinger.cardType > contrasteder.cardType) {
                // return false;
                result = false;
            } else {
                //同样的牌型
                result = judgeFun.contrastSameType(contrastinger.cardType, contrastinger.card, contrasteder.card);
            }


            if (result) {
                //当前用户赢了,被比较的用户输了
                //存活玩家数量减一
                roomInfo.aliveNumber -= 1


                //将当前用户存活状态置为1,存活
                contrastinger.liveStatus = 1;

                //将被比较用户存活状态置为0,输
                contrasteder.liveStatus = 0;

                //输的用户的存货状态置为0
                flowerUserList.filter(user => {
                    return user.username == contrasteder.username
                })[0].liveStatus = 0

                if (roomInfo.aliveNumber < 2) {
                    //本局游戏结束
                    //求得赢家id
                    flowerUserList.forEach((user) => {
                        if (user.liveStatus) {
                            //赢家
                            roomInfo.lastWinner.id = user.id; //设为最近的赢家
                            roomInfo.lastWinner.username = user.username;
                            user.coin = roomInfo.coinPool
                        }
                    });
                    roomInfo.coinPool = 0; //锅里的钱置零

                    room.roomInfo = roomInfo
                    room.flowerUserList = flowerUserList

                    // 更新数据的条件查询
                    var wherestr = { 'roomId': data.roomId };
                    // 执行更新数据
                    var updatestr = { 'flowerUserList': flowerUserList, 'roomInfo': roomInfo };

                    FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
                        io.sockets.in("room-" + data.roomId).emit('nowGameEnd', { room, 'loser': contrasteder });
                    })

                    //五秒后开始下一局
                    setTimeout(() => {
                        let newRoom = beginNewGame(room)
                        room.roomInfo = newRoom.roomInfo
                        room.flowerUserList = newRoom.flowerUserList

                        // 更新数据的条件查询
                        var wherestr = { 'roomId': data.roomId };
                        // 执行更新数据
                        var updatestr = { 'flowerUserList': room.flowerUserList, 'roomInfo': room.roomInfo };
                        FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
                            io.sockets.in("room-" + data.roomId).emit('sendNewCards', room);

                        })
                    }, 5000);
                } else {
                    //仍有玩家存活,游戏继续

                    //得出下一家
                    let newActiveUserId = (activeUserId + 1) % userNumber
                    while (!flowerUserList.filter(user => {
                        return user.id == newActiveUserId
                    })[0].liveStatus) {
                        newActiveUserId = (newActiveUserId + 1) % userNumber
                    }
                    roomInfo.activeUser.id = newActiveUserId
                    roomInfo.activeUser.username = flowerUserList.filter(user => {
                        return user.id == newActiveUserId
                    })[0].username

                    //广播游戏状态,发送弃牌者的loseId使其存活状态改为0,
                    room.roomInfo = roomInfo
                    room.flowerUserList = flowerUserList

                    // 更新数据的条件查询
                    var wherestr = { 'roomId': data.roomId };
                    // 执行更新数据
                    var updatestr = { 'flowerUserList': flowerUserList, 'roomInfo': roomInfo };

                    FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
                        io.sockets.in("room-" + data.roomId).emit('contrastResult', { 'winner': contrastinger, 'loser': contrasteder, room });
                    })
                }
            } else {
                //被比较的赢了,当前用户输了
                //存活玩家数量减一
                roomInfo.aliveNumber -= 1


                //将被比较用户存活状态置为1,存活
                contrasteder.liveStatus = 1;

                //将当前用户存活状态置为0,输
                contrastinger.liveStatus = 0;

                //输的用户的存活状态置为0
                flowerUserList.filter(user => {
                    return user.username == contrastinger.username
                })[0].liveStatus = 0

                if (roomInfo.aliveNumber < 2) {
                    //本局游戏结束
                    //求得赢家id
                    flowerUserList.forEach((user) => {
                        if (user.liveStatus) {
                            //赢家
                            roomInfo.lastWinner.id = user.id; //设为最近的赢家
                            roomInfo.lastWinner.username = user.username;
                            user.coin = roomInfo.coinPool
                        }
                    });
                    roomInfo.coinPool = 0; //锅里的钱置零

                    room.roomInfo = roomInfo
                    room.flowerUserList = flowerUserList

                    // 更新数据的条件查询
                    var wherestr = { 'roomId': data.roomId };
                    // 执行更新数据
                    var updatestr = { 'flowerUserList': flowerUserList, 'roomInfo': roomInfo };

                    FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {

                        io.sockets.in("room-" + data.roomId).emit('nowGameEnd', { room, 'loser': contrastinger });
                    })
                    //五秒后开始下一局
                    setTimeout(() => {
                        let newRoom = beginNewGame(room)
                        room.roomInfo = newRoom.roomInfo
                        room.flowerUserList = newRoom.flowerUserList

                        // 更新数据的条件查询
                        var wherestr = { 'roomId': data.roomId };
                        // 执行更新数据
                        var updatestr = { 'flowerUserList': room.flowerUserList, 'roomInfo': room.roomInfo };
                        FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
                            io.sockets.in("room-" + data.roomId).emit('sendNewCards', room);
                        })
                    }, 5000);
                } else {
                    //仍有玩家存活,游戏继续

                    //得出下一家
                    let newActiveUserId = (activeUserId + 1) % userNumber
                    while (!flowerUserList.filter(user => {
                        return user.id == newActiveUserId
                    })[0].liveStatus) {
                        newActiveUserId = (newActiveUserId + 1) % userNumber
                    }
                    roomInfo.activeUser.id = newActiveUserId
                    roomInfo.activeUser.username = flowerUserList.filter(user => {
                        return user.id == newActiveUserId
                    })[0].username

                    //广播游戏状态,发送弃牌者的loseId使其存活状态改为0,
                    room.roomInfo = roomInfo
                    room.flowerUserList = flowerUserList

                    // 更新数据的条件查询
                    var wherestr = { 'roomId': data.roomId };
                    // 执行更新数据
                    var updatestr = { 'flowerUserList': flowerUserList, 'roomInfo': roomInfo };

                    FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
                        io.sockets.in("room-" + data.roomId).emit('contrastResult', { 'winner': contrasteder, 'loser': contrastinger, room });
                    })
                }
            }
        })
    })

    //跟注
    socket.on('follow', data => {
        let userNumber = null;
        let roomInfo = {};
        let flowerUserList = []
        let coinNum = data.coinNum  //扔的钱 null跟注 !null加倍
        let bottomCoin = null
        let activeUserId = null;
        let activeUser = null;
        FlowerRoom.findOne({ roomId: data.roomId }).then((room) => {
            userNumber = room.flowerUserList.length;
            flowerUserList = room.flowerUserList;
            roomInfo = room.roomInfo;
            bottomCoin = roomInfo.bottomCoin;
            activeUserId = roomInfo.activeUser.id
            activeUser = flowerUserList.filter((user) => {
                return user.id == activeUserId
            })[0]

            if (!coinNum) {
                //只选择了跟注,则跟注目前的底分倍数
                if (activeUser.cardStatus) {
                    //看牌跟注
                    activeUser.coin -= bottomCoin * 2;
                    activeUser.isDown += bottomCoin * 2;
                    roomInfo.coinPool += bottomCoin * 2;
                } else {
                    //闷牌跟注
                    activeUser.coin -= bottomCoin;
                    activeUser.isDown += bottomCoin;
                    roomInfo.coinPool += bottomCoin;
                }
            } else {
                //加倍
                if (activeUser.cardStatus) {
                    //看牌加倍
                    roomInfo.bottomCoin = coinNum / 2;
                    activeUser.coin -= coinNum;
                    activeUser.isDown += coinNum;
                    roomInfo.coinPool += coinNum;
                } else {
                    //闷牌加倍
                    roomInfo.bottomCoin = coinNum;
                    activeUser.coin -= coinNum;
                    activeUser.isDown += coinNum;
                    roomInfo.coinPool += coinNum;
                }
            }

            //得出下一家
            let newActiveUserId = (activeUserId + 1) % userNumber
            while (!flowerUserList.filter(user => {
                return user.id == newActiveUserId
            })[0].liveStatus) {
                newActiveUserId = (newActiveUserId + 1) % userNumber
            }
            roomInfo.activeUser.id = newActiveUserId
            roomInfo.activeUser.username = flowerUserList.filter(user => {
                return user.id == newActiveUserId
            })[0].username

            roomInfo.bottomCoin = bottomCoin;

            room.roomInfo = roomInfo
            room.flowerUserList = flowerUserList

            // 更新数据的条件查询
            var wherestr = { 'roomId': data.roomId };
            // 执行更新数据
            var updatestr = { 'flowerUserList': flowerUserList, 'roomInfo': roomInfo };

            FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {

                io.sockets.in("room-" + data.roomId).emit('follow', room);
            })
        })

    })
});

//开启新的一局
function beginNewGame(room) {
    let roomInfo = room.roomInfo;
    let flowerUserList = room.flowerUserList
    let activeUserId = room.roomInfo.activeUser.id;
    let userNumber = room.flowerUserList.length;

    //局数加1
    roomInfo.gamesNumber += 1;
    //设置存活玩家数量
    roomInfo.aliveNumber = userNumber;
    //设置为开局状态
    roomInfo.status = 1;
    //重置底分
    roomInfo.bottomCoin = 1;
    //重置锅底
    roomInfo.coinPool = 0;
    //发牌
    for (let i = 0; i < userNumber; i++) {
        flowerUserList[i].card.splice(0, flowerUserList[i].card.length);
    }
    let pockers = pockerFun.creatPoker()
    let lastCards = 52;
    lastCards = lastCards - userNumber * 3;
    while (pockers.length > lastCards) {
        //只要牌堆的牌大于应该剩余牌数，玩家继续摸牌
        for (let i = 0; i < userNumber; i++) {
            //玩家轮流摸牌
            flowerUserList[i].card.push(pockers.pop());
        }
    }
    //重置用户的信息
    for (let i = 0; i < userNumber; i++) {
        flowerUserList[i].cardStatus = 0; //设置还未看牌
        flowerUserList[i].liveStatus = 1; //设置存活
        flowerUserList[i].cardType = judgeFun.judge(flowerUserList[i].card);
    }
    //设置上一局的赢家的下家为先手
    let newActiveUser =
        flowerUserList[
        (roomInfo.lastWinner.id + 1) % userNumber
        ];
    roomInfo.activeUser.username = newActiveUser.username;
    roomInfo.activeUser.id = newActiveUser.id;

    room.roomInfo = roomInfo
    room.flowerUserList = flowerUserList
    return room
}

module.exports = io