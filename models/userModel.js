const mongoose = require('mongoose')
var Schema = mongoose.Schema

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

//将文档结构发布为模型
module.exports = User = mongoose.model('User', userSchema, 'users');