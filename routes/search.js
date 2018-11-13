const express = require('express');
const router = express.Router();
const profileOSS = require('../models/profileOSS');
const techOSS = require('../models/technologyOSS');
const imageOSS = require('../models/imageAreaOSS');

router.get('/', function (req, res) {
    console.log(req.query);
    if(req.isAuthenticated()){
        profileOSS.getProfileImage(req.user.id, function (err, url) {
            if(err) throw err;
            req.profile = url;
            res.render('search', { profile: url });
        });
    }else{
        res.render('search');
    }
});

// todo 判断用户是否登录
// todo 用户卡片样式
router.post('/', function (req, res) {
    let query = req.body.word;
    let type = req.body.type;
    let page = req.body.page_id;
    if(type === "UI"){
        // 全搜索，并返回总数
        techOSS.search(query, function (err, result) {
            result.image_total_num = result.images.length;
            result.user_total_num = result.users.length;
            console.log(result);
            res.json(result);
        });
    }else if(type === "U"){
        // 用户
        techOSS.searchUsers(query, function (err, result) {
            let start = (page - 1) * 3;
            result.users = result.users.slice(start, start+3);
            console.log(result);
            res.json(result);
        });
    }else{
        techOSS.searchImages(query, function (err, result) {
            let start = (page - 1) * 3;
            result.images = result.images.slice(start, start+3);
            console.log(result);
            res.json(result);
        })
    }
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}

module.exports = router;
