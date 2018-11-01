const Oss = require('ali-oss');
const fs = require('fs');

// 配置OSS，指定为储存用户头像的Bucket
const ImageClient = module.exports = new Oss(
    {
        region: "oss-cn-beijing",
        accessKeyId: "LTAI1E6DI9yoVsel",
        accessKeySecret: "YWAwMg1zXbF0MKwhTVNt0rbNcJST6F",
        bucket: "image-area"
    }
);

/**
 * 随用户注册成功时在Bucket(image-area)里创建目录
 * 目录分为public和private，以及用户信息的json文件
 * @param newUser 用户信息
 * @param callback 回调函数：callback(err, msg)
 * @returns {Promise<void>}
 */
module.exports.createUserArea = async function(newUser, callback){
    try{
        let result1 = await ImageClient.put(newUser.username + "/public/", new Buffer("Hello"));
        let result2 = await ImageClient.put(newUser.username + "/private/", new Buffer("Hello"));
        let result3 = await ImageClient.put(newUser.username + "/info.json", new Buffer(JSON.stringify(newUser)));
        console.log("createUserArea result", result1, result2);
        callback(null, "创建成功");
    }catch (e) {
        callback(e, null);
    }
};

/**
 * 上传多张图片到
 * @param username 用户名
 * @param images 图片数组[]，每一项是图片的元信息（JSON格式）
 * {
        "filename": "图片名",
        'uploadname': "在uploads文件夹中的名字"
        "tags": ["tag1", "tag2", "tag3"],
        "business": true,      // 是否商用，true或false
        "download": true,      // 是否能下载，true或false
        "policy": "private",   // 私密（private）或公开(public)
        "album": "旅游"         // 所在相册
 * }
 * @param callback 回调函数：callback(err)
 * @returns {Promise<void>}
 */
module.exports.uploadImages = async function(username, images, callback) {
    try{
        for(let i = 0; i < images.length; i++){
            let info = images[i];
            let image = fs.createReadStream('./uploads/' + info.uploadname);
            // 带元数据上传
            let result = ImageClient.put(formImagePath(username, info), image, {
                meta: info
            });
            // 关闭流
            image.close();
            // 删除本地文件
            fs.unlinkSync('./upload/' + info.uploadname);
            console.log("upload images", result);
        }
        //TODO 更新用户的数据量（私密量）
        callback(null);
    }catch (e) {
        callback(e);
    }
};

/**
 * 从云端获取图片
 * @param username 用户名
 * @param policy 权限（公开还是私密）
 * @param album 相册名
 * @param callback 回调函数：callback(err, urls)
 * @returns {string} 图片URL数组
 */
module.exports.getImages = async function(username, policy, album, callback) {
    try{
        let dir = formImageDir(username, policy, album);
        let objects = getObjectsFromDir(dir);
        let urls = [];
        for(let i = 0; i < objects.length; i++){
            let url = await ImageClient.signatureUrl(objects[i]);
            urls.push(url);
        }
        callback(null, urls);
    }catch (e) {
        callback(e, null);
    }
};

/**
 * 合成上传照片的云端路径
 * @param username 用户名
 * @param info 图片信息
 * @returns {string} 路径
 */
function formImagePath(username, info) {
    return username + '/' + info.policy + '/' + info.album + '/' + info.filename;
}

/**
 * 合成云端图片目录
 * @param username 用户名
 * @param policy 权限
 * @param album 相册名
 * @returns {string} 目录名
 */
function formImageDir(username, policy, album) {
    return username + '/' + policy + '/' + album + '/';
}

/**
 * 从云端目录获取所有对象
 * @param dir
 * @return {object} 对象数组，通过put访问
 */
async function getObjectsFromDir(dir) {
    try{
        let result = await ImageClient.list({
            prefix: dir,
            delimiter: '/'
        });
        let objects = [];
        result.objects.forEach(function (obj) {
             objects.push(obj.name);
        });
        return objects;
    }catch (e) {
        console.log(e);
        return null;
    }
}

function getUserInfo(username) {

}