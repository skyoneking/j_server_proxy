
/**
 * websocket逻辑
 */
const http = require('http')
const Websocket = require('ws')

let ws = new Websocket('ws://localhost:5050')

ws.on('message', messageHandle)
// .on('error', errorHandle)

// 关闭句柄
function errorHandle(e) {
    console.log(e)
    ws = null
    
    const intervel = 2000
    const timerId = setInterval(() => {
        if(ws) {
            clearInterval(timerId)
            return;
        }
        ws = new Websocket('ws://localhost:5050')
        ws.on('message', messageHandle).on('error', errorHandle)

    }, intervel)
}

// 当前工作
let work = null // request
// 请求句柄
function messageHandle(buff) {
    if(work) {
        // 工作中
        if(buff.toString() === '%end%') {
            // 已结束
            work.end()
            work = null
            return;
        }
        work.write(buff)
        return;
    }

    // 初始化工作
    const baseRea = JSON.parse(buff.toString())
    const {url, method, header} = baseRea

    const reqOpt = {
        protocol: 'http:',
        host: 'localhost',
        port: 6000,
        path: url,
        method,
        headers: header
    }
    const req = http.request(reqOpt, res => {
        res.on('data', chunk => {
            ws.send(chunk)
        })
        res.on('end', () => {
            ws.send(Buffer.from('%end%'))
        })
    })
    if(method === 'POST' || method === 'PUT') {
        work = req
        return;
    }
    // get、delete
    req.end()
    
}
