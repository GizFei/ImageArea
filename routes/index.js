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
            res.render('home', { active: "Home", profile: url });
        });
    }else{ // 游客模式
        res.render('home', { active: 'Home'});
    }
});

router.post('/images', function (req, res) {
    // console.log("techOSS", techOSS.getRandomImages);
    techOSS.getRandomImages(async function (err, images) {
        if(req.isAuthenticated()){
            for(let i = 0; i < images.length; i++){
                if(images[i].name)
                    images[i].iflike = await imageOSS.ifUserLikeTheImage(req.user.username, images[i].uuid);
            }
        }
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
        console.log("提交评论", message);
        imageOSS.uploadMessage(req.user.username, message, function (err, msg) {
            if (err) {
                res.json({ status: 'error', msg: err });
                throw err;
            }
            res.json({status: 'success', messages: msg });
        });
    }else{
        res.json({
            status: "error",
            msg: "未登录"
        });
    }
});

router.post('/like', function (req, res) {
    console.log("like", req.body);
    // 点赞
    if(req.isAuthenticated()){ // 已登录
        let imgInfo = {
            uuid: req.body.id,
            owner: req.body.owner
        };
        let ifLike = req.body.ifLike === 'true'; // 是否喜爱
        console.log("喜爱", imgInfo);
        if(ifLike){
            imageOSS.addLikeToImage(req.user.username, imgInfo, function (err) {
                if(err){
                    res.json({ status: 'error', msg: "后台错误" });
                    throw err;
                }else{
                    res.json({ status: 'success', msg: "点赞成功" });
                }
            });
        }else{
            imageOSS.removeLikeOfImage(req.user.username, imgInfo, function (err) {
                if(err){
                    res.json({ status: 'error', msg: "后台错误" });
                    throw err;
                }else{
                    res.json({ status: 'success', msg: "取消点赞成功" });
                }
            });
        }
    }else{
        res.json({
            status: "error",
            msg: "未登录"
        });
    }
    // res.json({status: "success"});
});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/users/login');
}

module.exports = router;
