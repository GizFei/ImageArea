const express = require('express');
const router = express.Router();
const profileOSS = require('../models/profileOSS');
const techOSS = require('../models/technologyOSS');
const imageOSS = require('../models/imageAreaOSS');

/* GET home page. */
// res.render渲染'index.pug'模板
// 路由设置，相当于flask的路由
// router.get('/',ensureAuthenticated, function(req, res, next) {
//     console.log("Login in");
//     profileOSS.getProfileImage(req.user.id, function (err, url) {
//         if(err) throw err;
//         req.profile = url;
//         res.render('index', { active: "Home", profile: url });
//     });
// });

router.get('/', function (req, res) {
    // 已登录
    if(req.isAuthenticated()){
        profileOSS.getProfileImage(req.user.id, function (err, url) {
            if(err) throw err;
            req.profile = url;
            res.render('index', { active: "Home", profile: url });
        });
    }else{ // 游客模式
        res.render('index', { active: 'Home'});
    }
});

router.post('/images', function (req, res) {
    // console.log("techOSS", techOSS.getRandomImages);
    techOSS.getRandomImages(function (err, images) {
        console.log(images);
        res.json(images);
    });
});

router.post('/messages', function (req, res) {
    // 上传评论
    if(req.isAuthenticated()){ // 已登录
        let message = {
            id: req.body.id,
            msg: req.body.msg,
            date: req.body.date,
            owner: req.body.owner
    };
        console.log(message);
        imageOSS.uploadMessage(req.user.username, message, function (err) {
            if (err) throw err;
            res.json({status: 'success'});
        });
    }else{
        res.json({
            status: "error",
            msg: "未登录"
        });
    }
});

router.post('/like', function (req, res) {
    console.log(req.body.id);
    res.json({status: "success"});
});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/users/login');
}

module.exports = router;
