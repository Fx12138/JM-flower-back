const mongoose = require('mongoose');
var Schema = mongoose.Schema
//连接数据库
mongoose.connect('mongodb://localhost:27017/flower').then(() => {
    console.log("数据库连接成功");
}).catch(() => {
    console.log('数据库连接失败');

})

var userSchema = new Schema({
    username: {
        type: String,
        default: "等待玩家"
    },
    id: {
        type: Number,
        default: 0
    },
    avatar: {
        type: String,
        default: "https://pics2.baidu.com/feed/d439b6003af33a87d09366a244ca5f3e5243b52c.jpeg?token=19c07c3198e503f6ef6eda74ad4be6d2&s=50B00C734B5172D44F8051EC0300E023"
    },
    password: String
})

//设计集合结构
// var roomSchema = new Schema({
//     roomId: String,
//     roomInfo: {
//         status: Number, //开局状态,0未开局,1已开局,2比牌等待选择
//         activeUser: {
//             id: Number,
//             username: String,
//         },
//         lastWinner: {
//             id: Number,
//         },
//         coinPool: Number,
//         gamesNumber: Number,
//         bottomCoin: Number,
//     },
//     flowerUserList: [
//         {
//             id: Number,
//             avatar: String,
//             username: String,
//             card: [{
//                 color: String,
//                 number: Number,
//                 name: String,
//                 order: Number,
//                 power: Number,
//                 path: String,
//             }],
//             cardType: Number,
//             coin: Number,
//             isDown: Number,
//             cardStatus: Number, //是否看牌 0未看,1看了
//             liveStatus: Number, //是否弃牌或输 0输,1活着
//         },
//     ]
// })

// //将文档结构发布为模型
const User = mongoose.model('user', userSchema);

// //添加数据
// const room = new FlowerRoom({
//     roomId: 111111,
//     roomInfo: {
//         status: 0, //开局状态,0未开局,1已开局,2比牌等待选择
//         activeUser: {
//             id: null,
//             username: "",
//         },
//         lastWinner: {
//             id: 0,
//         },
//         coinPool: 0,
//         gamesNumber: 1,
//         bottomCoin: 1,
//     },
//     flowerUserList: [
//         {
//             id: 0,
//             avatar:
//                 "https://img1.baidu.com/it/u=3583591450,2292153595&fm=26&fmt=auto&gp=0.jpg",
//             username: "等待玩家",
//             card: [],
//             cardType: null,
//             coin: 0,
//             isDown: 0,
//             cardStatus: 0, //是否看牌 0未看,1看了
//             liveStatus: 0, //是否弃牌或输 0输,1活着
//         },
//         {
//             id: 1,
//             avatar:
//                 "https://img1.baidu.com/it/u=3583591450,2292153595&fm=26&fmt=auto&gp=0.jpg",
//             username: "等待玩家",
//             card: [],
//             cardType: null,
//             coin: 0,
//             isDown: 0,
//             cardStatus: 0, //是否看牌 0未看,1看了
//             liveStatus: 0, //是否弃牌或输 0输,1活着
//         },
//         {
//             id: 2,
//             avatar:
//                 "https://img1.baidu.com/it/u=3583591450,2292153595&fm=26&fmt=auto&gp=0.jpg",
//             username: "等待玩家",
//             card: [],
//             cardType: null,
//             coin: 0,
//             isDown: 0,
//             cardStatus: 0, //是否看牌 0未看,1看了
//             liveStatus: 0, //是否弃牌或输 0输,1活着
//         },
//         {
//             id: 3,
//             avatar:
//                 "https://img1.baidu.com/it/u=3583591450,2292153595&fm=26&fmt=auto&gp=0.jpg",
//             username: "等待玩家",
//             card: [],
//             cardType: null,
//             coin: 0,
//             isDown: 0,
//             cardStatus: 0, //是否看牌 0未看,1看了
//             liveStatus: 0, //是否弃牌或输 0输,1活着
//         },
//         {
//             id: 4,
//             avatar:
//                 "https://img1.baidu.com/it/u=3583591450,2292153595&fm=26&fmt=auto&gp=0.jpg",
//             username: "等待玩家",
//             card: [],
//             cardType: null,
//             coin: 0,
//             isDown: 0,
//             cardStatus: 0, //是否看牌 0未看,1看了
//             liveStatus: 0, //是否弃牌或输 0输,1活着
//         },
//         {
//             id: 5,
//             avatar:
//                 "https://img1.baidu.com/it/u=3583591450,2292153595&fm=26&fmt=auto&gp=0.jpg",
//             username: "等待玩家",
//             card: [],
//             cardType: null,
//             coin: 0,
//             isDown: 0,
//             cardStatus: 0, //是否看牌 0未看,1看了
//             liveStatus: 0, //是否弃牌或输 0输,1活着
//         },
//     ],
// });
// room.save().then(() => console.log('保存成功'));

// 数据查询
User.findOne({ username: "lisi" }, function (err, res) {
    console.log(res);
});

//删除数据
// FlowerRoom.remove({ roomId: "111111" }, () => {
//     console.log('删除成功');
// })