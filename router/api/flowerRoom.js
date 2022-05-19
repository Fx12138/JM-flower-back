var express = require('express')
var router = express.Router()
var resJson = require('../doc/resJson')

const FlowerRoom = require('../../models/flowerRoom')

//根据roomId获取房间
function getRoomById(roomId) {
    FlowerRoom.findOne({ roomId: roomId }).then((room) => {
        return room
    })
}
//根据id获取房间
router.get('/room', (req, res) => {
    FlowerRoom.findOne({ roomId: req.query.roomId }).then((room) => {
        return res.json(resJson(room, '获取成功', 200))
    })
})

//获取房间列表
router.get('/rooms', (req, res) => {
    FlowerRoom.find().then((rooms) => {
        return res.json(resJson(rooms, '获取成功', 200))
    })
})
/**
 * 创建房间
 */
router.post('/createRoom', function (req, res) {
    // res.send(req.body)

    //随机生成6位数房间号
    var roomId = "";
    do {
        roomId = "";
        for (var i = 0; i < 6; i++) {
            roomId += Math.floor(Math.random() * 10);
        }
    } while (getRoomById(roomId))

    //创建房间
    FlowerRoom.findOne({ roomId: roomId }).then((room) => {
        if (room) {
            return res.json(resJson(room, '房间已存在', 401))
        } else {
            //添加数据
            const room = new FlowerRoom({
                roomId: roomId,
                roomName: req.body.roomName,
                password: req.body.password,
                flowerUserList: [
                    {
                        id: 0,
                        username: req.body.user.username,
                    },
                ],
            });
            room.save().then(() => {
                return res.json(resJson(room, '创建成功', 200))
            });
        }
    })

})

//进入房间
router.post("/inRoom", (req, res) => {
    let flowerUserList = []
    FlowerRoom.findOne({ roomId: req.body.roomId }).then((room) => {
        if (room) {
            //判断密码
            if (room.password != req.body.password) {
                return res.json(resJson(null, '密码错误', 401))
            }
            //密码正确
            flowerUserList = room.flowerUserList
            if (flowerUserList.length < 6) {
                let newUser = {
                    id: room.flowerUserList.length,
                    username: req.body.username
                }
                flowerUserList.push(newUser)
                // 更新数据的条件查询
                var wherestr = { 'roomId': req.body.roomId };
                // 执行更新数据
                var updatestr = { 'flowerUserList': flowerUserList };

                FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
                    FlowerRoom.findOne({ roomId: req.body.roomId }).then((room) => {
                        return res.json(resJson(room.flowerUserList, '加入房间成功', 200))
                    })
                })
            } else {
                return res.json(resJson(null, '房间人数已满', 400))
            }

        } else {
            return res.json(resJson(null, '房间不存在', 404))
        }
    })

})

//获取房间内用户列表
router.get('/flowerUserList', (req, res) => {
    FlowerRoom.findOne({ roomId: req.query.roomId }).then((room) => {
        return res.json(resJson(room.flowerUserList, '获取成功', 200))
    })
})

//退出房间
router.get('/outRoom', (req, res) => {
    let flowerUserList = []
    FlowerRoom.findOne({ roomId: req.query.roomId }).then((room) => {
        flowerUserList = room.flowerUserList
        flowerUserList.map((user, index) => {
            if (user.username == req.query.username) {
                flowerUserList.splice(index, 1);
            }
        });
        // 更新数据的条件查询
        var wherestr = { 'roomId': req.query.roomId };
        // 执行更新数据
        var updatestr = { 'flowerUserList': flowerUserList };

        FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
            return res.json(resJson(result, '退出房间', 200))
        })
    })
})

//保存房间信息
router.post('/saveRoomStatus', (req, res) => {


    let roomId = JSON.parse(req.body.roomInfo).roomId
    let roomInfo = JSON.parse(req.body.roomInfo)
    let flowerUserList = JSON.parse(req.body.flowerUserList)

    FlowerRoom.findOne({ roomId: roomId }).then((room) => {

        room.roomInfo = roomInfo
        room.flowerUserList = flowerUserList
        room.save().then(() => {
            // console.log(room);

        })

    })

    // // 更新数据的条件查询
    // let roomId = req.body.roomInfo.roomInfo.roomId;

    // var wherestr = { 'roomId': roomId };
    // let flowerUserList = JSON.parse(req.body.roomInfo.flowerUserList)
    // console.log(flowerUserList[5]);

    // // 执行更新数据
    // var updatestr = { 'flowerUserList': flowerUserList, 'roomInfo': req.body.roomInfo.roomInfo };

    // FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
    //     return res.json(resJson(result, '保存成功', 200))
    // })
})

module.exports = router