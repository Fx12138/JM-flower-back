module.exports = function (data = {}, msg = "请求成功", code = 200) {
    return ({
        data, msg, code
    })
}