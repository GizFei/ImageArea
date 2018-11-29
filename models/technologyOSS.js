const Oss = require('ali-oss');
const random = require('random-js')();
const cp = require('child_process');
const fs = require('fs');

// 配置OSS，指定为储存用户头像的Bucket
const ImageClient = new Oss(
    {
        region: "oss-cn-beijing",
        accessKeyId: "LTAI1E6DI9yoVsel",
        accessKeySecret: "YWAwMg1zXbF0MKwhTVNt0rbNcJST6F",
        bucket: "image-area"
    }
);

const TechClient = module.exports = new Oss({
    region: "oss-cn-beijing",
    accessKeyId: "LTAI1E6DI9yoVsel",
    accessKeySecret: "YWAwMg1zXbF0MKwhTVNt0rbNcJST6F",
    bucket: "image-area-tech"
});

/**
 * 首页图片
 * @param callback
 * @return {Promise<void>}
 */
module.exports.getRandomImages = async function(callback){
    try {
        let usersDir = await getDirs("");
        let images = [];
        let empty = 0;
        for (let i = 0; i < 5; i++) {
            let x = random.integer(0, usersDir.length - 1);
            // console.log("user", usersDir[x]);
            let result = await ImageClient.get(usersDir[x] + "public/info.json");
            let info = JSON.parse(result.content.toString());
            let keys = Object.keys(info); // 获得键
            if(keys.length === 0){
                i--;
                empty += 1;
                if(empty === usersDir.length){
                    break;
                }
            }
            let x2 = random.integer(0, keys.length - 1);
            // console.log("keys", keys[x2]);
            if(keys[x2]){
                let infoDetail = info[keys[x2]];
                infoDetail.messages = await getMessagesOfImage(infoDetail.owner, infoDetail.uuid);
                if(infoDetail.watermark){
                    infoDetail.url = formWatermarkUrl(infoDetail.owner, infoDetail.url);
                }
                images.push(infoDetail);
            }else{
                i--;
                // images.push({});
            }
        }
        callback(null, images);
    } catch (e) {
        callback(e, []);
    }
};

/**
 * 搜索函数，搜索用户名和标签名
 * @param query 搜索字符串
 * @param callback 回调函数：callback(err, result)
 * @return {Promise<void>}
 */
module.exports.search = async function(query, callback){
    try {
        let result = {
            users: [],
            images: []
        };

        // 查找用户
        let usersDir = await getDirs("");
        console.log("search", usersDir);
        usersDir.forEach(async function (dir) {
            if(dir.match(query)){
                let info = await getUserInfo(dir.slice(0, dir.length-1));
                result.users.push({
                    username: info.username,
                    avatar: info.avatar,
                    introduction: info.introduction
                })
            }
        });

        result.images = await searchTagByQuery(query);
        callback(null, result);
    } catch (e) {
        callback(e, {
            users: [],
            images: []
        });
    }
};

/**
 * 搜索函数，搜索用户名
 * @param query 搜索字符串
 * @param callback 回调函数：callback(err, result)
 */
module.exports.searchUsers = async function(query, callback){
    try {
        let result = {
            users: []
        };

        // 查找用户
        let usersDir = await getDirs("");
        console.log("search", usersDir);
        usersDir.forEach(async function (dir) {
            if(dir.match(query)){
                let info = await getUserInfo(dir.slice(0, dir.length-1));
                result.users.push({
                    username: info.username,
                    avatar: info.avatar,
                    introduction: info.introduction
                })
            }
        });

        callback(null, result);
    } catch (e) {
        callback(e, {
            users: []
        });
    }
};

/**
 * 搜索函数，搜索标签名
 * @param query 搜索字符串
 * @param callback 回调函数：callback(err, result)
 * @return {Promise<void>}
 */
module.exports.searchImages = async function(query, callback){
    try {
        let result = {
            images: []
        };

        result.images = await searchTagByQuery(query);
        callback(null, result);
    } catch (e) {
        callback(e, {
            images: []
        });
    }
};

/**
 * 将图片分类至各个标签
 * @param imagesInfo 图片信息
 * @param callback 回调函数：callback(err)
 */
module.exports.addImageToTags = async function(imagesInfo, callback){
    try {
        let result = await TechClient.list({
            prefix: "",
            delimiter: '/'
        });
        let objects = [];
        console.log(result);
        if(result.objects){
            result.objects.forEach(function (obj) {
                objects.push(obj.name);
            });
        }
        console.log("add image to tag dirs", objects);
        if (objects.length === 0) { // 还没有文件
            let r = await TechClient.put("tag0.json", new Buffer(JSON.stringify({})));
            objects.push("tag0.json");
        }
        let tagFile = objects[objects.length - 1]; // 最后一个文件
        let tagInfo = await TechClient.get(tagFile);
        if (tagInfo.content.length >= 200 * 1024) { // 最新的文件大小大于200KB，则新建一个
            let n = "tag" + objects.length + ".json";
            objects.push(n);
            let r = await TechClient.put(n, new Buffer(JSON.stringify({})));
        }
        tagInfo = await TechClient.get(objects[objects.length - 1]);
        tagInfo = JSON.parse(tagInfo.content.toString()); // 标签信息 {}

        imagesInfo.forEach(function (info) {
            let tags = info.tags;
            tags.forEach(function (tag) {
                if (!tagInfo[tag])
                    tagInfo[tag] = [];
                tagInfo[tag].push({
                    name: info.name,
                    uuid: info.uuid,
                    owner: info.owner,
                    url: info.url
                });
            });
        });
        let r = await TechClient.put(objects[objects.length - 1], new Buffer(JSON.stringify(tagInfo)));
        console.log("addImageToTag", r);
        callback(null);
    } catch (e) {
        console.log(e);
        callback(e);
    }
};

/**
 * 移除标签中的图片信息
 * @param imagesInfo 批图片信息
 * @param callback 回调函数：callback(err)
 */
module.exports.removeImageOfTags = async function(imagesInfo, callback){
    try { // 获得所有标签文件
        let result = await TechClient.list({
            prefix: "",
            delimiter: '/'
        });
        let objects = [];
        if (result.objects) {
            result.objects.forEach(function (obj) {
                objects.push(obj.name);
            });
        }
        // 遍历每个文件
        for (let i = 0; i < objects.length; i++) {
            let r = await TechClient.get(objects[i]);
            let tagInfo = JSON.parse(r.content.toString());
            if (imagesInfo.length === 0)
                break;
            // 遍历每张图片
            for (let j = 0; j < imagesInfo.length; j++) {
                let tags = imagesInfo[j].tags; // 所有标签
                console.log("removeImageOfTags tags", tags, imagesInfo[j].uuid);
                // 遍历标签
                for (let m = 0; m < tags.length; m++) {
                    let tag = tags[m];
                    if (tagInfo.hasOwnProperty(tag)) {
                        console.log("removeImageOfTags tag info", tagInfo[tag]);
                        for (let k = 0; k < tagInfo[tag].length; k++) {
                            console.log("removeImageOfTags tags compare",tagInfo[tag][k].uuid, imagesInfo[j].uuid);
                            if (tagInfo[tag][k].uuid === imagesInfo[j].uuid) {
                                console.log("removeImageOfTags tags uuid", imagesInfo[j].uuid);
                                tagInfo[tag].splice(k, 1);
                                // 删除图片中的标签
                                // imagesInfo[j].tags.splice(m, 1);
                                break;
                            }
                        }
                    }
                }
                // 标签搜索完了
                // if (tags.length === 0) {
                //     imagesInfo.splice(j, 1);
                // }
            }
            // 上传信息
            await TechClient.put(objects[i], new Buffer(JSON.stringify(tagInfo)));
        }
        callback(null);
    } catch (e) {
        callback(e);
    }
};

/**
 * 获取所有标签
 * @param callback 回调函数：callback(err, tagsResult)
 * @return {Promise<void>}
 */
module.exports.getAllTags = async function(callback){
    try {
        let tagsResult = [];
        let result = await TechClient.list({
            prefix: "",
            delimiter: '/'
        });
        let objects = [];
        result.objects.forEach(function (obj) {
            objects.push(obj.name);
        });
        console.log("get All Tags", objects);
        for (let i = 0; i < objects.length; i++) {
            let r = await TechClient.get(objects[i]);
            // 标签文件里的json信息
            let tagInfo = JSON.parse(r.content.toString());
            let tags = Object.keys(tagInfo);
            tags.forEach(function (tag) {
                tagsResult.push(tag);
            });
        }
        callback(null, tagsResult);
    } catch (e) {
        callback(e, []);
    }
};

module.exports.detectTagsOfImage = async function(files, callback){
    let arg1 = 'E:\\WebStormProject\\ImageArea\\detection';
    let arg2 = 'E:\\WebStormProject\\ImageArea\\object_detection\\result.json';

    cp.exec('python E:\\WebStormProject\\ImageArea\\object_detection\\object_detection_image2json.py '+arg1+' '+arg2+' ', (err, stdout, stderr) => {
        if (err){
            console.log('stderr', err);
            callback(err, []);
        }
        if (stdout){
            console.log('stdout', stdout);
            for(let i = 0; i < files.length; i++){
                fs.unlinkSync(files[i]);
            }
            let JSONResult = JSON.parse(fs.readFileSync(arg2));
            let tags = Object.keys(JSONResult);
            fs.unlinkSync(arg2);
            console.log(tags);
            callback(null, tags);
        }else{
            callback("NULl", []);
        }
    });
};

module.exports.detectTagsOfImageRelatively = async function(files, callback){
    let arg1 = 'E:\\WebStormProject\\ImageArea\\detection';
    let arg2 = 'E:\\WebStormProject\\ImageArea\\object_detection\\result.json';

    cp.exec('python E:\\WebStormProject\\ImageArea\\object_detection\\object_detection_image2json.py '+arg1+' '+arg2+' ', (err, stdout, stderr) => {
        if (err){
            console.log('stderr', err);
            callback(err, []);
        }
        if (stdout){
            console.log('stdout', stdout);

            let JSONResult = JSON.parse(fs.readFileSync(arg2));
            let tags = Object.keys(JSONResult);
            let result = {};
            for(let i = 0; i < files.length; i++){
                let name = files[i].name;
                let path = files[i].path;
                for(let j = 0; j < tags.length; j++){
                    if(JSONResult[tags[j]].includes(path)){
                        if(result[name]){
                            result[name].push(tags[j]);
                        }else{
                            result[name] = [];
                            result[name].push(tags[j]);
                        }
                    }
                }
                // 删除文件
                console.log('unlink path', path);
                fs.unlinkSync(path);
            }
            fs.unlinkSync(arg2);
            console.log(result);
            callback(null, result);
        }else{
            callback("NULl", []);
        }
    });
};

/**
 * 获取所有标签和它的图片数
 * @param callback 回调函数：callback(err, tagsResult)
 * t = {
 *     name: 标签名
 *     frequency: 图片数
 * }
 * @return {Promise<void>}
 */
module.exports.getAllTagsWithFreq = async function(callback){
    try {
        let tagsResult = {};
        let result = await TechClient.list({
            prefix: "",
            delimiter: '/'
        });
        let objects = [];
        result.objects.forEach(function (obj) {
            objects.push(obj.name);
        });
        console.log("get All Tags", objects);
        for (let i = 0; i < objects.length; i++) {
            let r = await TechClient.get(objects[i]);
            // 标签文件里的json信息
            let tagInfo = JSON.parse(r.content.toString());
            let tags = Object.keys(tagInfo);
            tags.forEach(function (tag) {
                // 已经有该标签
                if(tagsResult.hasOwnProperty(tag)){
                    tagsResult[tag].frequency += tagInfo[tag].length;
                }else{
                    tagsResult[tag] = tagInfo[tag].length;
                }
            });
        }
        // 转换为数组
        let finalResult = [];
        let tagKeys = Object.keys(tagsResult);
        if(tagKeys){
            tagKeys.forEach(function (tagKey) {
                let t = {
                    name: tagKey,
                    frequency: tagsResult[tagKey]
                };
                finalResult.push(t);
            });
            callback(null, finalResult);
        }else{
            callback(null, []);
        }
    } catch (e) {
        callback(e, []);
    }
};

async function searchTagByQuery(query){
    let searchResult = [];
    try {
        let result = await TechClient.list({
            prefix: "",
            delimiter: '/'
        });
        let objects = [];
        result.objects.forEach(function (obj) {
            objects.push(obj.name);
        });
        console.log("searchTagByQuery", objects);
        for (let i = 0; i < objects.length; i++) {
            let r = await TechClient.get(objects[i]);
            let tagInfo = JSON.parse(r.content.toString());
            let tags = Object.keys(tagInfo);
            for(let j = 0; j < tags.length; j++){
                let tag = tags[j];
                // 匹配字符串，相邻
                if (tag.match(query)) {
                    let imagesInfo = tagInfo[tag];
                    for(let k = 0; k < imagesInfo.length; k++){
                        searchResult.push(imagesInfo[k]);
                    }
                }
            }
        }
        console.log("Search tag by query", searchResult);
        return searchResult;
    } catch (e) {
        console.log("Search tag by query", searchResult);
        return searchResult;
    }
}

/**
 * 从云端目录获取dir下的所有目录（ImageClient）
 * @return {object} 对象数组，通过put访问
 */
async function getDirs(dir) {
    try{
        let result = await ImageClient.list({
            prefix: dir,
            delimiter: '/'
        });
        let dirs = [];
        result.prefixes.forEach(function (prefix) {
            dirs.push(prefix);
        });
        return dirs;
    }catch (e) {
        console.log("getObjectsFromDir", e);
        return [];
    }
}

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

//获取评论
async function getMessagesOfImage(username, imgId) {
    try {
        let messages = await getMessages(username);
        let messageDetail = messages[imgId];
        if(messageDetail){
            console.log("Get Comments Of Image", messageDetail);
            messageDetail.reverse();
            return messageDetail.slice(0, 3); // 返回三条评论;
        }else{
            return [];
        }
    } catch (e) {
        console.log(e);
        return [];
    }
};

async function getMessages(username){
    try {
        let result = await ImageClient.get(username + '/public/messages.json');
        return JSON.parse(result.content.toString());
    } catch (e) {
        console.log(e);
    }
}

/**
 * 生成带图片水印的URL
 * @param username 用户名
 * @param imgUrl 图片URL
 * @return {string} 带水印的图片URL
 */
function formWatermarkUrl(username, imgUrl) {
    let text = Buffer.from("@ " + username).toString("base64");
    let style = '?x-oss-process=image/watermark,type_d3F5LW1pY3JvaGVp,size_30,text_' + text + ',color_FFFFFF,t_60,g_se,x_10,y_10';
    return (imgUrl + style);
}

