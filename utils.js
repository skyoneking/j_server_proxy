// 将对象合成为get参数
function object2queryString(params) {
    if(typeof params !== 'object') return ''
    return Object.entries(params).map(d=>encodeURIComponent(d[0]) + '=' + encodeURIComponent(d[1])).join('&')
}

// 将get参数解析为对象
function getQueryObject(search) {
    const params = {}
    const reg = /([^?&=]+)=([^?&=]*)/g;
    search.replace(reg, (s, $1, $2) => {
        const k = decodeURIComponent($1)
        const v = decodeURIComponent($2)
        params[k] = v
        return s
    })
    return params;
}

module.exports = {
    object2queryString,
    getQueryObject
}