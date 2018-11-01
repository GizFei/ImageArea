const Oss = require('ali-oss');
const fs = require('fs');

// 配置OSS
const OSS = new Oss(
    {
        region: "oss-cn-beijing",
        accessKeyId: "LTAI1E6DI9yoVsel",
        accessKeySecret: "YWAwMg1zXbF0MKwhTVNt0rbNcJST6F",
        bucket: 'dam-test'
    }
);

async function newDir() {
    try{
        let result = await OSS.put("newDir/abcd.txt", new Buffer("KKK"));
        console.log(result);
    }catch (e) {
        console.log(e);
    }
}

// newDir();

// 列举bucket中的文件
async function list(dir) {
    try {
        let result = await OSS.list({
            prefix: dir,
            delimiter: '/'
        });
        result.objects.forEach(function (obj) {
            console.log(obj.name);
        });
        console.log(result);
    }catch (err) {
        console.log(err);
    }
}

// 上传文件，使用put函数
async function uploadFile() {
    try {
        let image = fs.createReadStream("../uploads/aafd69a869e80555205c478898561777");
        let result = await OSS.putStream('image.jpg', image, {
            meta: {
                name: 'test',
                date: 'today'
            }
        });
        console.log(result);
    }catch (err) {
        console.log(err);
    }
}

// 下载云端users.json文件，返回Buffer，将其转化为json对象
async function downloadUsersJson(){
    let result = await UserDB.get(USER_DB_FILENAME);
    let users = JSON.parse(result.content.toString());
    console.log(users);
    return users;
}

async function downloadFile(){
    let result = await OSS.get("image.jpg");
    console.log(result);
}

// 删除一个文件
async function deleteFile(){
    try{
        let result = await UserDB.delete('object-name');
        console.log(result);
    }catch (err) {
        console.log(err);
    }
}

list("newDir/");
// uploadFile();
// downloadFile();
// downloadUsersJson();
// deleteFile();
// module.exports.createUser({
//     username: "Test3",
//     password: "123456123456",
//     email: '123@qq.com'
// }, function (err, msg) {
//     console.log(msg);
// });