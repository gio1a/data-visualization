/**
 * @todo 计算服务器总耗时
 */

module.exports = async (ctx, next) => {
    const start = Date.now()
    await next()
    const duration = Date.now() - start

    // 设置响应头
    ctx.set('X-Response-Time', duration + 'ms')
}