const Koa = require('koa')
const app = new Koa()

const resDuration = require('./middleware/response_duration')
const resHeader = require('./middleware/response_header')
const resData = require('./middleware/response_data')

app.use(resDuration)
app.use(resHeader)
app.use(resData)

app.listen(8888,()=>{
    console.log('Server is listening on 8888...')
})

const webSocketService = require('./service/web_socket')
webSocketService.listen() // 开启监听