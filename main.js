const Koa = require('koa')
const WebSocket = require('ws')

const {object2queryString, getQueryObject} = require('./utils')

const host = 'localhost'
const wsPort = 3040
const httpPort = 3020

// websocket通信
let wsClient = null
let wsServer = null

// 通道
function messageTrgger(isServer, data) {
    const anotherWs = isServer ? wsClient : wsServer
    if(!anotherWs) {
        return;
    }
    anotherWs.send(data)
}

const wss = new WebSocket.Server({port: wsPort}, () => {
    console.log(`websocket server at: ws://${host}:${wsPort}`)
})
wss.on('connection', (ws, res) => {
    const {headers, url} = res
    const query = getQueryObject(url)

    const isServer = query.wsType === 'server'
    if(isServer) {
        wsServer = ws;
    } else {
        wsClient = ws
    }

    // 监听事件
    ws.on('message', data => {
        messageTrgger(isServer, data)
    })

})
wss.on('error', e => {
    console.log(e)
})



// http通信
// const app = new Koa()

// app.use(async ctx => {
//     ctx.body = 'hello world'
// })

// app.listen(httpPort, () => {
//     console.log(`server setup on http://${host}:${httpPort}`)
// })