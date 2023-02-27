const path = require("path")
const WebSocket = require("ws")
const fileUtils = require("../utils/file")

// 创建WebSocket server
const server = new WebSocket.Server({ port: 9998 })

module.exports.listen = () => {

    // 监听客户端的连接事件
    // client: 客户端的连接socket对象
    server.on("connection", client => {
        console.log("有客户端连接成功了...");

        // 监听客户端 message
        client.on("message", async (msg) => {
            console.log("客户端向服务端发送了数据 ---> " + msg)

            let payload = JSON.parse(msg);
            const action = payload.action;
            if (action === "getData") {
                let filePath = path.join(__dirname, "../data/" + payload.chartName + ".json")
                const chartData = await fileUtils.getFileJsonData(filePath)
                payload.data = chartData
                client.send(JSON.stringify(payload)) // 将图表数据发给客户端
            } else {
                // 原封不动的将所接收到的数据转发给每一个处于连接状态的客户端
                // server.clients : 所有客户端的连接
                server.clients.forEach((client) => {
                    client.send(msg);
                })
            }
        })
    })
}
