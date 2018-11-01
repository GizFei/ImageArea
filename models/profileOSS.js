const Oss = require('ali-oss');
const fs = require('fs');

// 配置OSS，指定为储存用户头像的Bucket
const ProfileClient = module.exports = new Oss(
    {
        region: "oss-cn-beijing",
        accessKeyId: "LTAI1E6DI9yoVsel",
        accessKeySecret: "YWAwMg1zXbF0MKwhTVNt0rbNcJST6F",
        bucket: "image-area-profile"
    }
);

/**
 * 上传用户头像函数，统一后缀png
 * @param userId 用户ID
 * @param profile 上传时的文件信息(req.file)或者未定义头像文件undefinedProfile.jpg
 * @param callback 回调函数：callback(err)
 * @returns {Promise<void>}
 */
module.exports.uploadProfile = async function(userId, profile, callback) {
    try{
        if(profile === "undefinedProfile.png"){
            let result = await ProfileClient.put(userId + ".png", "./uploads/undefinedProfile.png");
            console.log("uploadProfile result", result);
            callback(null);
            return;
        }
        let profile_image = fs.readFileSync('./uploads/' + profile.filename);
        let tmpFile = './uploads/temp.png';
        fs.writeFileSync(tmpFile, profile_image);
        let result = await ProfileClient.put(userId + ".png", tmpFile);
        fs.unlinkSync(tmpFile);
        if(profile !== "undefinedProfile.png")
            fs.unlinkSync('./uploads/' + profile.filename);
        // profile_image.close();
        console.log("uploadProfile result", result);
        callback(null);
    }catch (err) {
        console.log(err);
        callback(err);
    }
};

/**
 * 上传用户头像函数（带图片格式），放弃，使用统一后缀png
 * @param userId 用户ID
 * @param profile 上传时的文件信息(req.file)或者未定义头像文件undefinedProfile.jpg
 * @param callback 回调函数：callback(err)
 * @returns {Promise<void>}
 */
module.exports.uploadProfileWithMode = async function(userId, profile, callback) {
    try{
        if(profile === "undefinedProfile.png"){
            let result = await ProfileClient.put(userId + ".jpg", "./uploads/undefinedProfile.png");
            console.log("uploadProfile result", result);
            callback(null);
            return;
        }
        let profile_image = fs.readFileSync('./uploads/' + profile.filename);
        let imgMode = "." + profile.originalname.split(".")[1];
        let tmpFile = './uploads/temp' + imgMode;
        fs.writeFileSync(tmpFile, profile_image);
        let result = await ProfileClient.put(userId + imgMode, tmpFile);
        fs.unlinkSync(tmpFile);
        if(profile !== "undefinedProfile.png")
            fs.unlinkSync('./uploads/' + profile.filename);
        // profile_image.close();
        console.log("uploadProfile result", result);
        callback(null);
    }catch (err) {
        console.log(err);
        callback(err);
    }
};

/**
 * 获得用户头像
 * @param userId 用户的ID
 * @param callback 回调函数：callback(err, profile_img_url)
 * @returns {Promise<void>}
 */
module.exports.getProfileImage = async function(userId, callback){
    try{
        let imgUrl = await ProfileClient.signatureUrl(userId + ".png");
        console.log("getProfileImage url", imgUrl);
        callback(null, imgUrl);
    }catch (err) {
        callback(err, null);
        console.log(err);
    }
};