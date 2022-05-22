var express = require('express')
var router = express.Router()
var resJson = require('../doc/resJson')

const User = require('../../models/userModel')

router.post('/register', (req, res) => {
    console.log(req.body);

    User.findOne({ username: req.body.username }).then((user) => {
        if (user) {
            return res.json({ data: user, msg: "当前用户名已被注册", code: 401 })
        } else {
            const newUser = new User({
                username: req.body.username,
                password: req.body.password
            })
            newUser.save().then(() => {
                return res.json({ data: newUser, msg: "注册成功", code: 200 })
            })
        }
    })

})
//登录
router.post('/login', (req, res) => {


    User.findOne({ username: req.body.username }, (err, user) => {
        if (user) {
            if (user.password == req.body.password) {
                return res.json({ data: user, msg: "登陆成功", code: 200 })
            } else {
                return res.json({ msg: "用户名或密码错误" })
            }
        } else {
            return res.json(resJson(null, '用户不存在', 403,))
        }
    })
})

//获取所有用用户
router.get('/getUsers', (req, res) => {
    console.log('哈哈哈哈哈哈');

    return res.json({ msg: "用户不存在" })
})

module.exports = router