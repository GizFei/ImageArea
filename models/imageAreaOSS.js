const Oss = require('ali-oss');
const fs = require('fs');
const path = require('path');
const UUID = require('uuid/v1');

const techOSS = require('../models/technologyOSS');

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
        // 初始信息
        let userInfo = {
            id: newUser.id,
            username: newUser.username, 	// 用户名
            email: newUser.email, 			// 邮箱
            avatar: "https://image-area-profile.oss-cn-beijing.aliyuncs.com/" + newUser.id + ".png",               // 头像url
            tags: ["人物", "风景", "人造物", "建筑", "动植物", "食物"], 	// 拥有的标签
            introduction: "",
            capacity: 1000,  					// 总量
            privatecapacity: 300, 			// 私密量
            vip: false,      					// 是否为会员(boolean),
            albums: [
                {
                    albumname: '默认相册',
                    policy: 'public',
                    albumurl: newUser.username + '/public/默认相册',
                }
            ],    		 // 所有的相册名
            ingroup: "",                // 所属群组
            privateused: 0,  				// 已用私密量,
            capacityused: 0 				// 已用总量
        };
        let result1 = await ImageClient.put(newUser.username + "/public/", new Buffer("Hello"));
        let result2 = await ImageClient.put(newUser.username + "/private/", new Buffer("Hello"));
        let result3 = await ImageClient.put(newUser.username + "/info.json", new Buffer(JSON.stringify(userInfo)));
        let result4 = await ImageClient.put(newUser.username + "/public/info.json", new Buffer(JSON.stringify({})));
        let result6 = await ImageClient.put(newUser.username + "/public/messages.json", new Buffer(JSON.stringify({})));
        let result5 = await ImageClient.put(newUser.username + "/private/info.json", new Buffer(JSON.stringify({})));
        // console.log("createUserArea result", result1, result2, result3, result4, result5);
        callback(null, "创建成功");
    }catch (e) {
        callback(e, null);
    }
};

/**
 * 上传多张图片到云端
 * @param username 用户名
 * @param images 图片数组[]，每一项是图片的元信息（JSON格式）
 * {
        "name": "用户自定义图片名"
        "filename": "图片名"带后缀,
        'uploadname': "在uploads文件夹中的名字"
        "tags": ["tag1", "tag2", "tag3"],
        "business": true,      // 是否商用，true或false
        "download": true,      // 是否能下载，true或false
        "policy": "private",   // 私密（private）或公开(public)
        "album": "旅游"         // 所在相册
        "likes" : 0            // 点赞数
        "messages": [{         // 留言
            username: "user1",
            msg: "msg1"
        }, {
            username: "user2,
            msg: "msg2"
        }, ...]
 * }
 * @param callback 回调函数：callback(err)
 * @returns {Promise<void>}
 */
module.exports.uploadImages = async function(username, images, callback) {
    try{
        let userInfo = await getUserInfo(username);
        let albumInfo = userInfo.albums;
        let publicInfo = await getPublicImagesInfo(username);
        let privateInfo = await getPrivateImagesInfo(username);

        let result = await ImageClient.get(username + "/public/messages.json");
        let messages = JSON.parse(result.content.toString());
        let imagesInfo = [];

        for(let i = 0; i < images.length; i++){
            let info = images[i];
            let image = fs.createReadStream(info.path);
            // 判断是否超出私密量或总量
            if((userInfo.capacityused + 1) > userInfo.capacity){
                callback("问题到达上限");
                return;
            }else{
                // 总量加1
                userInfo.capacityused += 1;
            }
            let policy = getPolicyOfAlbum(albumInfo, info.album);
            if(policy === 'private'){
                if((userInfo.privateused + 1) > userInfo.privatecapacity){
                    callback("私密量到达上限");
                    return;
                }else{
                    // 私密量加1
                    userInfo.privateused += 1;
                }
            }
            // 图片信息
            let imageInfo = {
                name: info.name,
                uuid: UUID(),                   // 生成唯一标识符
                owner: username,
                avatar: userInfo.avatar,
                tags: info.tags,
                business: info.business,        // 是否商用，true或false
                download: info.download,        // 是否能下载，true或false
                album: getAlbumDetail(albumInfo, info.album),    // 所在相册信息
                likes: 0,                       // 点赞数
                date: info.date
            };
            let path = formImagePath(username, policy, info.album, info.name, info.path);
            imageInfo.url = "https://image-area.oss-cn-beijing.aliyuncs.com/" + path;
            let result = await ImageClient.put(path, image, {
                meta: {
                    uuid: imageInfo.uuid  // 带标识符元数据上传
                }
            });
            if(policy === "private"){
                privateInfo[imageInfo.uuid] = imageInfo;
            }else{
                messages[imageInfo.uuid] = []; // 加入留言（公开的图片）
                imagesInfo.push(imageInfo);
                publicInfo[imageInfo.uuid] = imageInfo;
            }
            // 关闭流
            image.close();
            // 删除本地文件
            fs.unlinkSync(info.path);
            console.log("upload images", result);
        }
        // 更新用户的数据量（总量、私密量），图片信息，留言信息
        let r1 = await uploadUserInfo(username, userInfo);
        let r2 = await uploadPrivateImagesInfo(username, privateInfo);
        let r3 = await uploadPublicImagesInfo(username, publicInfo);
        let r4 = await ImageClient.put(username + '/public/messages.json', new Buffer(JSON.stringify(messages)));
        techOSS.addImageToTags(imagesInfo, function (err) {
            callback(err);
        });
        // callback(null);
    }catch (e) {
        callback(e);
    }
};

/**
 * 从云端获取某个相册的图片
 * @param username 用户名
 * @param albumInfo 相册信息
 * @param callback 回调函数：callback(err, infos)
 * @returns {object} 图片信息数组
 */
module.exports.getImages = async function(username, albumInfo, callback) {
    try{
        let dir = albumInfo.albumurl;
        let objects = await getObjectsFromDir(dir);
        console.log("get Images", objects);
        if(albumInfo.policy === "public"){
            var imagesInfo = await getPublicImagesInfo(username);
        }else{
            imagesInfo = await getPrivateImagesInfo(username);
        }
        let infos = [];
        for(let i = 0; i < objects.length; i++){
            let result = await ImageClient.get(objects[i]);
            let uuid = result.res.headers['x-oss-meta-uuid'];
            let info = imagesInfo[uuid];

            if(info && albumInfo.policy === "public"){
                info.messages = await getMessagesOfImage(info.owner, info.uuid);
                infos.push(info);
            }else{
                infos.push(info);
            }
            console.log("INFO", info);
        }
        callback(null, infos);
    }catch (e) {
        callback(e, []);
    }
};

/**
 * 添加新的相册
 * @param username 用户名
 * @param albumInfo 传进来的相册信息
 * {
 *     albumname: "name",
 *     policy: "public"
 * }
 * @param callback 回调函数：callback(err)
 * @return {Promise<void>}
 */
module.exports.addAlbum = async function(username, albumInfo, callback){
    try {
        let albumurl = formImageDir(username, albumInfo.policy, albumInfo.albumname);
        let albumDetail = {
            albumname: albumInfo.albumname,
            policy: albumInfo.policy,
            albumurl: albumurl
        };
        let userInfo = await getUserInfo(username);
        userInfo.albums.push(albumDetail);
        let result = await uploadUserInfo(username, userInfo);
        callback(null);
    } catch (e) {
        callback(e);
    }
};

/**
 * 只获得用户的标签和相册名
 * @param username 用户名
 * @param callback 回调函数：callback(err, {tags: [], albums: []})
 */
module.exports.getTagsAndAlbums = async function(username, callback) {
    try {
        let userInfo = await getUserInfo(username);
        let tags = userInfo.tags;
        let albums = [];
        for (let i = 0; i < userInfo.albums.length; i++) {
            albums.push(userInfo.albums[i].albumname);
        }
        console.log("get Tags And Albums", tags, albums);
        callback(null, {
            tags: tags,
            albums: albums
        });
    } catch (e) {
        callback(e, {
            tags: [],
            albums: []
        });
    }
};

module.exports.getPrivateAlbums = async function(username, callback) {
    try {
        let userInfo = await getUserInfo(username);
        let albums = [];
        for (let i = 0; i < userInfo.albums.length; i++) {
            if(userInfo.albums[i].policy === "private")
                albums.push(userInfo.albums[i]);
        }
        for(let i = 0; i < albums.length; i++){
            let objects = await getObjectsFromDir(albums[i].albumurl);
            if(objects.length > 0){
                let coverUrl = await ImageClient.signatureUrl(objects[0]);
                albums[i].coverUrl = coverUrl;
            }else{
                albums[i].coverUrl = "/images/photo.jpg";
            }
        }
        console.log("get Tags And Albums", albums);
        callback(null, albums);
    } catch (e) {
        callback(e, []);
    }
};

module.exports.getPublicAlbums = async function(username, callback) {
    try {
        let userInfo = await getUserInfo(username);
        let albums = [];
        for (let i = 0; i < userInfo.albums.length; i++) {
            if(userInfo.albums[i].policy === "public")
                albums.push(userInfo.albums[i]);
        }
        for(let i = 0; i < albums.length; i++){
            let objects = await getObjectsFromDir(albums[i].albumurl);
            if(objects.length > 0){
                albums[i].coverUrl = await ImageClient.signatureUrl(objects[0]);
            }else{
                albums[i].coverUrl = "/images/photo.jpg";
            }
        }
        console.log("get Tags And Albums", albums);
        callback(null, albums);
    } catch (e) {
        callback(e, []);
    }
};

/**
 * 提交评论，成功后返回最新的三条评论用于刷新
 * @param username 用户名
 * @param message 留言
 * @param callback 回调函数：callback(err, messages)
 */
module.exports.uploadMessage = async function(username, message, callback) {
    try {
        let userInfo = await getUserInfo(username);
        let m = {
            username: username,
            avatar: userInfo.avatar,
            date: message.date,
            msg: message.msg
        };
        let messages = await getMessages(message.owner);
        console.log("upload Message", messages);
        let messageDetail = messages[message.id];
        if(messageDetail){
            messageDetail.push(m);
            messages[message.id] = messageDetail;
            let result = await ImageClient.put(message.owner + "/public/messages.json", new Buffer(JSON.stringify(messages)));
            messageDetail.reverse();
            callback(null, messageDetail.slice(0, 3));
        }else{
            callback("没有找到id", []);
        }

    } catch (e) {
        callback(e, []);
    }
};

module.exports.getMessagesOfImage = async function(username, imgId, callback) {
    try {
        let messages = await getMessages(username);
        let messageDetail = messages[imgId];
        console.log("Get Comments Of Image", messageDetail);
        let msg = messageDetail.slice(0, 3); // 返回三条评论
        callback(null, msg);
    } catch (e) {
        callback(e, []);
    }
};


module.exports.addLikeToImage = async function(username, imgInfo, callback){

};

async function getMessages(username){
    try {
        let result = await ImageClient.get(username + '/public/messages.json');
        return JSON.parse(result.content.toString());
    } catch (e) {
        console.log(e);
    }
}

async function getMessagesOfImage(username, imgId) {
    try {
        let messages = await getMessages(username);
        let messageDetail = messages[imgId];
        console.log("Get Comments Of Image", messageDetail);
        return messageDetail !== undefined ? messageDetail : [];
    } catch (e) {
        return [];
    }
};

function getAlbumDetail(albuminfo, albumname) {
    for(let i = 0; i < albuminfo.length; i++){
        if(albuminfo[i].albumname === albumname){
            return albuminfo[i];
        }
    }
    return {};
}

function getPolicyOfAlbum(albuminfo, albumname) {
    for(let i = 0; i < albuminfo.length; i++){
        if(albuminfo[i].albumname === albumname){
            return albuminfo[i].policy;
        }
    }
    return "public";
}

/**
 * 合成上传照片的云端路径
 * @param username 用户名
 * @param policy 图片信息
 * @param album 相册名
 * @param name 图片名
 * @param imgPath 图片路径
 * @returns {string} 路径
 */
function formImagePath(username, policy, album, name, imgPath) {
    let mode = path.extname(imgPath);
    return username + '/' + policy + '/' + album + '/' + name + mode;
}

/**
 * 合成云端图片目录
 * @param username 用户名
 * @param policy 权限
 * @param album 相册名
 * @returns {string} 目录名
 */
function formImageDir(username, policy, album) {
    // 返回目录名，最后要带正斜杠
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
        console.log("get Objects From Dir", result);
        let objects = [];
        if(result.objects === undefined){
            return [];
        }
        result.objects.forEach(function (obj) {
             objects.push(obj.name);
        });
        // 第一个是当前自己的目录，去掉
        // objects = objects.slice(1);
        return objects;
    }catch (e) {
        console.log("getObjectsFromDir", e);
        return [];
    }
}

/**
 * 获取用户信息
 * @param username 用户名
 * @param callback 回调函数(err, info)
 */
module.exports.getUserInformation = async function(username, callback) {
    try{
        let info = await getUserInfo(username);
        callback(null, info);
    }catch (e) {
        console.log("getUserInfo", e);
        callback(e, {});
    }
};

/**
 * 上传用户个人说明
 * @param username 用户名
 * @param intro 个人说明
 * @param callback 回调函数：callback(err)
 */
module.exports.uploadIntroduction = async function(username, intro, callback){
    try{
        let userInfo = await getUserInfo(username);
        userInfo.introduction = intro;
        let result = await uploadUserInfo(username, userInfo);
        callback(null);
    }catch (e) {
        callback(e);
    }
};

/**
 * 开通会员
 * @param username 用户名
 * @param callback 回调函数：callback(err)
 */
module.exports.openVip = async function(username, callback){
    try{
        let userInfo = await getUserInfo(username);
        userInfo.vip = true;
        let result = await uploadUserInfo(username, userInfo);
        callback(null);
    }catch (e) {
        callback(e);
    }
};

/**
 * 更改会员用户私密量
 * @param username 用户名
 * @param pc 新的私密量
 * @param callback 回调函数：callback(err)
 */
module.exports.changePrivateCapacity = async function(username, pc, callback){
    try{
        let userInfo = await getUserInfo(username);
        userInfo.privatecapacity = pc;
        let result = await uploadUserInfo(username, userInfo);
        callback(null);
    }catch (e) {
        callback(e);
    }
};

/**
 * 会员用户添加新的标签
 * @param username 用户名
 * @param tags 新添加的标签列表
 * @param callback 回调函数：callback(err)
 */
module.exports.addTag = async function(username, tags, callback){
    try{
        let userInfo = await getUserInfo(username);
        tags.forEach(function(tag){
            userInfo.tags.push(tag);
        });
        let result = await uploadUserInfo(username, userInfo);
        callback(null);
    }catch (e) {
        callback(e);
    }
};

/**
 * 获取用户信息
 * @param username 用户名
 * @return {Promise<*>} 用户信息的Object
 */
async function getUserInfo(username){
    try{
        let result = await ImageClient.get(username + '/info.json');
        console.log("getUserInfo", result);
        // result是请求结果，包含更多的东西，通过键content获取实际需要的内容
        return JSON.parse(result.content.toString());
    }catch (e) {
        console.log("getUserInfo", e);
        return {};
    }
}

/**
 * 上传用户信息
 * @param username 用户名
 * @param userinfo 用户信息
 * @return {Promise<void>} 无返回结果
 */
async function uploadUserInfo(username, userinfo) {
    try{
        let result = await ImageClient.put(username + '/info.json', new Buffer(JSON.stringify(userinfo)));
        console.log("update user info", result);
    }catch (e) {
        console.log("getUserInfo", e);
    }
}

/**
 * 获得用户公开图片信息
 * @param username 用户名
 * @return {Object} 信息对象
 */
async function getPublicImagesInfo(username) {
    try{
        let result = await ImageClient.get(username + '/public/info.json');
        console.log("get Public Images Info", result);
        return JSON.parse(result.content.toString());
    }catch (e) {
        console.log(e);
        return [];
    }
}

/**
 * 上传公开图片信息
 * @param username 用户名
 * @param info 信息（JSON对象）
 * @return {Promise<void>}
 */
async function uploadPublicImagesInfo(username, info) {
    try{
        let result = await ImageClient.put(username + '/public/info.json', new Buffer(JSON.stringify(info)));
        console.log("upload Public Images Info", result);
    }catch (e) {
        console.log(e);
    }
}

/**
 * 获得用户私密图片信息
 * @param username 用户名
 * @return {Object} 信息对象
 */
async function getPrivateImagesInfo(username) {
    try{
        let result = await ImageClient.get(username + '/private/info.json');
        console.log("get Private Images Info", result);
        return JSON.parse(result.content.toString());
    }catch (e) {
        console.log(e);
        return [];
    }
}

/**
 * 上传私密图片信息
 * @param username 用户名
 * @param info 信息（JSON对象）
 * @return {Promise<void>}
 */
async function uploadPrivateImagesInfo(username, info) {
    try{
        let result = await ImageClient.put(username + '/private/info.json', new Buffer(JSON.stringify(info)));
        console.log("upload Private Images Info", result);
    }catch (e) {
        console.log(e);
    }
}