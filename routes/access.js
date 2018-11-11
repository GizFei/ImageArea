const express = require('express');
const router = express.Router();
const imageOSS = require('../models/imageAreaOSS');

// TODO 判断是否有用户登录，有则更新导航栏
router.get('/:username', function (req, res, next) {
    let username = req.params.username;
    if(req.isAuthenticated()){
        if(req.user.username === username){
            // 访问自己的相册，重定向
            res.redirect('/personal/album/public');
        }
    }
    imageOSS.getPublicAlbums(username, function (err, albums) {
        if(err){
            return next();
        }
        for(let i = 0; i < albums.length; i++){
            albums[i].albumurl = '/access/' + username + '/public/' + albums[i].albumname;
        }
        // TODO 返回不带用户的相册信息，重新写一个模板
        res.render("accessalbum", {username: username, albums: albums});
    });
});

router.get('/:username/public/:albumname', function (req, res, next) {
    let username = req.params.username;
    let albumname = req.params.albumname;
    let albumInfo = {
        albumname: albumname,
        policy: "public",
        albumurl: username + '/public/' + albumname + '/'
    };
    imageOSS.getImages(username, albumInfo, function (err, infos) {
        if(err) throw err;
        imageOSS.getUserInformation(username, function (err, info) {
            console.log("GET INFO",infos);
            // res.header("Access-Control-Allow-Origin", "*");
            return res.render("accessimage", {username: username, avatar: info.avatar, albumname: albumname, infos: infos});
        });
    });
});

// TODO 访问相册里的具体图片

module.exports = router;