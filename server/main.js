
/**
 * websocket逻辑
 */
const WebsocketServer = require('ws').Server

const wss = new WebsocketServer({
    port: 5050
})

// 传输数据的ws
let pipeWs = null;
let pipeResolveQueue = []; // 请求队列

// 建立ws pipe
wss.on('connection', (ws) => {
    pipeWs = ws
    let allData = ''
    pipeWs.on('message', buff => {
        if(buff.toString() === '%end%') {
            // 已结束
            usePipeResolve(allData)
            allData = ''
            return;
        }
        allData += buff
    })
})

// 请求被响应
function usePipeResolve(data) {
    pipeResolveQueue.shift()(data)
}

// 添加请求
async function enqueuePipeResolve(ctx, next) {
    const {method, url, header} = ctx

    if(pipeWs) {
        const headerString = JSON.stringify({
            method, url, header
        })
        const headerBuff = Buffer.from(headerString)
        pipeWs.send(headerBuff)
        if(method === 'POST' || method === 'PUT') {
            ctx.req.on('data', (chunk) => {
                pipeWs.send(chunk)
            }).on('end', () => {
                pipeWs.send(Buffer.from('%end%'))
            })
        }
    }
    const res = await new Promise((resolve, reject) => {
        pipeResolveQueue.push(resolve)
    })
    ctx.body = res
    await next()
}

/**
 * http逻辑
 */
const Koa = require('koa');
const cors = require('koa2-cors')

const app = new Koa()


app.use(enqueuePipeResolve)
app.use(cors())

app.listen(5000)
