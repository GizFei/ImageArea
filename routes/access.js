const express = require('express');
const router = express.Router();
const imageOSS = require('../models/imageAreaOSS');

router.get('*', function (req, res, next) {
    if(req.isAuthenticated()){
        imageOSS.getUserInformation(req.user.username, function (err, userInfo) {
            console.log("Avatar", userInfo.avatar);
            req.profile = userInfo.avatar;
            next();
        });
    }else {
        req.profile = "";
        next();
    }
});

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
        res.render("accessalbum", {username: username, albums: albums, profile: req.profile});
    });
});

// 访问相册里的具体图片
router.get('/:username/public/:albumname', function (req, res) {
    let username = req.params.username;
    let albumname = req.params.albumname;
    let albumInfo = {
        albumname: albumname,
        policy: "public",
        albumurl: username + '/public/' + albumname + '/'
    };
    imageOSS.getAccessImages(username, albumInfo, function (err, infos) {
        if(err) throw err;
        imageOSS.getUserInformation(username, function (err, info) {
            console.log("GET INFO",infos);
            // res.header("Access-Control-Allow-Origin", "*");
            res.render("accessimage", {username: username, avatar: info.avatar, albumname: albumname, infos: infos, profile: req.profile});
        });
    });
});

module.exports = router;