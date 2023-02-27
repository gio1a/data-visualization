/**
 * @todo 读取json文件中的数据
 */

const path = require("path");
const fileUtils = require("../utils/file");

module.exports = async (ctx, next) => {
    const url = ctx.request.url 
    let filePath = "../data" + url.replace("/api", "") + ".json" 
    filePath = path.join(__dirname, filePath)
    // console.log('filePath ---> ',filePath);
    try {
        ctx.response.body = await fileUtils.getFileJsonData(filePath)
    } catch (error) {
        ctx.response.body = JSON.stringify({
            message: error,
            status: 404
        })
    }

    await next();
};
