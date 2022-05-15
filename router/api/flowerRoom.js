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
            return res.status(400).json({ msg: "房间已经存在" })
        } else {
            //添加数据
            const room = new FlowerRoom({
                roomId: roomId,
                flowerUserList: [
                    {
                        id: 0,
                        username: req.body.username,
                    },
                ],
            });
            room.save().then(() => console.log('创建成功'));
            return res.status(200).json({ msg: "房间创建成功", data: room })
        }
    })

})

//进入房间
router.post("/inRoom", (req, res) => {
    let flowerUserList = []
    FlowerRoom.findOne({ roomId: req.body.roomId }).then((room) => {
        if (room) {
            flowerUserList = room.flowerUserList
            let isContain = flowerUserList.find(
                (user) => user.username == req.body.username
            );
            if (isContain) {
                // return res.json(resJson(null, '已在房间内', 400))
                return res.json(resJson(room.flowerUserList, '进入成功', 200))
            }
            if (room.flowerUserList.length < 6) {
                let newUser = {
                    id: room.flowerUserList.length + 1,
                    username: req.body.username
                }
                flowerUserList.push(newUser)
                console.log(newUser)
                // 更新数据的条件查询
                var wherestr = { 'roomId': req.body.roomId };
                // 执行更新数据
                var updatestr = { 'flowerUserList': flowerUserList };

                FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
                    FlowerRoom.findOne({ roomId: req.body.roomId }).then((room) => {
                        return res.json(resJson(room.flowerUserList, '加入房间成功', 200))
                    })
                    // return res.json(resJson(result, '加入房间成功', 200))
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

module.exports = router