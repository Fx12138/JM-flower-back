var express = require('express')
var router = express.Router()
var resJson = require('../doc/resJson')

const FlowerRoom = require('../../models/flowerRoom')

//发牌
router.post("/sendCard", (req, res) => {
    let flowerUserList = []

    FlowerRoom.findOne({ roomId: req.body.roomId }).then((room) => {
        flowerUserList = room.flowerUserList
        flowerUserList.forEach(user => {
            user.card = []
        })
        var lastCards = 52;
        lastCards = lastCards - flowerUserList.length * 3;
        //分发牌
        while (req.body.pockers.length > lastCards) {
            console.log('进入循环')
            //只要牌堆的牌大于应该剩余牌数，玩家继续摸牌
            for (let i = 0; i < flowerUserList.length; i++) {
                //玩家3人轮流摸牌
                flowerUserList[i].card.push(req.body.pockers.pop());
            }
        }
        // 更新数据的条件查询
        var wherestr = { 'roomId': req.body.roomId };
        // 执行更新数据
        var updatestr = { 'flowerUserList': flowerUserList };
        FlowerRoom.findOneAndUpdate(wherestr, updatestr, (err, result) => {
            let currentUser = flowerUserList.filter(user => {
                return user.username == req.body.username
            })[0]
            return res.json(resJson(currentUser.card, '退出房间', 200))
        })


    })
})
module.exports = router