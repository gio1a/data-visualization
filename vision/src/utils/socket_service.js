export default class SocketService {
    // 单例模式: 保证一个类仅有一个实例，并提供一个访问它的全局访问点

    static instance = null

    // 通过静态方法返回实例
    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService()
        }
        return this.instance
    }

    // 和服务端连接的socket对象
    ws = null

    // 存储回调函数
    callBackMapping = {}

    // 标识是否连接成功
    connected = false

    // 记录重试的次数
    sendRetryCount = 0

    // 重连的次数
    connectRetryCount = 0

    //  连接服务器
    connect() {
        // 连接服务器
        if (!window.WebSocket) {
            return console.log("您的浏览器不支持WebSocket!!!")
        }
        this.ws = new WebSocket("ws://localhost:9998")

        // 连接成功的事件
        this.ws.onopen = () => {
            console.log("与服务端成功...")
            this.connected = true
            // 重置重新连接的次数
            this.connectRetryCount = 0
        }

        // 连接服务端失败  或  当连接成功之后, 服务器关闭的情况
        this.ws.onclose = () => {
            console.log("连接失败...")
            this.connected = false
            // 断开重连
            this.connectRetryCount ++
            setTimeout(() => {
                this.connect()
            }, 500 * this.connectRetryCount)
        }

        // 得到服务端发来的数据
        this.ws.onmessage = msg => {
            console.log("从服务端获取到了数据...")
            // console.log('服务端发来的msg --------> ',msg)
            console.log('服务端发来的msg中的data --------> ',msg.data)
            const recvData = JSON.parse(msg.data)
            const socketType = recvData.socketType

            // 判断回调函数是否存在
            if (this.callBackMapping[socketType]) {
                const action = recvData.action
                if (action === "getData") {
                    const realData = JSON.parse(recvData.data)
                    this.callBackMapping[socketType].call(this, realData)
                } else if (action === "fullScreen") {
                    this.callBackMapping[socketType].call(this, recvData)
                } else if (action === "themeChange") {
                    this.callBackMapping[socketType].call(this, recvData)
                }
            }
        }
    }

    // 回调函数的注册
    registerCallBack(socketType, callBack) {
        this.callBackMapping[socketType] = callBack
    }

    // 回调函数的取消
    unRegisterCallBack(socketType) {
        this.callBackMapping[socketType] = null
    }

    // 发送数据的方法
    send(data) {
        // 判断有没有连接成功
        if (this.connected) {
            this.sendRetryCount = 0
            this.ws.send(JSON.stringify(data))
        } else {
            this.sendRetryCount ++
            setTimeout(() => {
                this.send(data)
            }, this.sendRetryCount * 500)
        }
    }
}
