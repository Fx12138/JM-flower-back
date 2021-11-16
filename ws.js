var http = require('http');
var server = http.createServer().listen(3000, () => {
    console.log('Server running ');
});//创建http服务

var io = require('socket.io').listen(server);
io.sockets.on('connection', (socket) => {
    console.log('新的用户连接成功！！！')
    socket.emit('login', { 'dadad': "dwdwdadad" })

    socket.on('test', data => {
        console.log('客服端发来的消息' + data)
    })


});