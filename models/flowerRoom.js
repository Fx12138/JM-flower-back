const mongoose = require('mongoose');
var Schema = mongoose.Schema

//设计集合结构
var roomSchema = new Schema({
    roomId: String,
    password: {
        type: String,
        default: "000000"
    },
    roomInfo: {
        status: {
            type: Number,
            default: 0
        }, //开局状态,0未开局,1已开局,2比牌等待选择
        activeUser: {
            id: {
                type: Number,
                default: 0
            },
            username: {
                type: String,
                default: "等待玩家"
            },
        },
        lastWinner: {
            id: {
                type: Number,
                default: 0
            },
        },
        coinPool: {
            type: Number,
            default: 0
        },
        gamesNumber: {
            type: Number,
            default: 0
        },
        bottomCoin: {
            type: Number,
            default: 0
        },
    },
    flowerUserList: [
        {
            id: {
                type: Number,
                default: 0
            },
            avatar: {
                type: String,
                default: "https://pics2.baidu.com/feed/d439b6003af33a87d09366a244ca5f3e5243b52c.jpeg?token=19c07c3198e503f6ef6eda74ad4be6d2&s=50B00C734B5172D44F8051EC0300E023"
            },
            username: {
                type: String,
                default: "等待玩家"
            },
            card: [{
                color: String,
                number: Number,
                name: String,
                order: Number,
                power: Number,
                path: String,
            }],
            cardType: Number,
            coin: {
                type: Number,
                default: 0
            },
            isDown: {
                type: Number,
                default: 0
            },
            cardStatus: {
                type: Number,
                default: 0
            }, //是否看牌 0未看,1看了
            liveStatus: {
                type: Number,
                default: 0
            }, //是否弃牌或输 0输,1活着
        },
    ]
})

//将文档结构发布为模型
module.exports = FlowerRoom = mongoose.model('FlowerRoom', roomSchema);

