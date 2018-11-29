const express = require('express');
const router = express.Router();
const imageOSS = require('../models/imageAreaOSS');
const profileOSS = require('../models/profileOSS');
const multer = require('multer');
const upload = multer({dest: './uploads'});

router.get('*', ensureAuthenticated, function (req, res, next) {
    profileOSS.getProfileImage(req.user.id, function (err, url) {
        if(err) throw err;
        console.log("upload pages", url);
        req.profile = url;
        next();
    });
});

router.get('/album/:policy', function (req, res, next) {
    // let albums = imageOSS.getTagsAndAlbums();
    if(req.params.policy === "public"){
        imageOSS.getPublicAlbums(req.user.username, function (err, albums) {
            for(let i = 0; i < albums.length; i++){
                albums[i].albumurl = '/personal/album/public/' + albums[i].albumname;
            }
            return res.render("album", {active:'personal', albums: albums, profile: req.profile, policy: "public"});
        });
    }else{
        imageOSS.getPrivateAlbums(req.user.username, function (err, albums) {
            for(let i = 0; i < albums.length; i++){
                albums[i].albumurl = '/personal/album/private/' + albums[i].albumname;
            }
            return res.render("album", {active:'personal', albums: albums, profile: req.profile, policy: "private"});
        });
    }
});

router.get('/album/:policy/:name', function (req, res, next) {
    let policy = req.params.policy;
    let albumname = req.params.name;
    let albumInfo = {
        albumname: req.params.name,
        albumurl: req.user.username + '/' + policy + '/' + albumname + '/',
        policy: policy
    };
    console.log("hhhhh");
    imageOSS.getImages(req.user.username, albumInfo, function (err, infos) {
        console.log("GET INFO",infos);
        if(policy === "public")
            return res.render("image", {albumname: albumname, active:'personal', infos: infos, profile: req.profile});
        else
            return res.render("privateimage", {albumname: albumname, active:'personal', infos: infos, profile: req.profile});
    });
});

router.get('/info', function (req, res){
    imageOSS.getUserInformation(req.user.username, function (err, info) {
        console.log("Info", info);
        res.render('info', {userInfo: info, profile: req.profile});
    });
});

router.post('/info/profile', upload.single('profile'), function (req, res) {
    let profile = req.file;
    console.log("Profile", profile);
    profileOSS.uploadProfile(req.user.id, profile, function (err) {
        if(err) throw err;
        res.redirect('/personal/info');
    });
});

router.post('/info/introduction', function (req, res) {
    console.log(req.body);
    let intro = req.body.intro;
    imageOSS.uploadIntroduction(req.user.username, intro, function (err) {
        if(err){
            res.json({status: "fail"});
            throw err;
        }
        res.json({status: "success"});
    });
});

router.post('/info/pc', function (req, res) {
    console.log(req.body);
    imageOSS.changePrivateCapacity(req.user.username, parseInt(req.body.pc), function (err) {
        if(err){
            res.json({status: "error", msg: err});
        }
        res.json({status: "success"});
    })
});

router.post('/album/new', function (req, res) {
    let albumInfo = {
        albumname: req.body.albumname,
        policy: req.body.policy
    };
    console.log("album new", albumInfo);
    imageOSS.addAlbum(req.user.username, albumInfo, function (err) {
        if(err){
            res.json({ status: 'error' });
            throw err;
        }else{
            res.json({ status: 'success' });
        }
    })
});

router.post('/vip/open', function (req, res) {
    let email = req.body.email;
    console.log(email);
    if(email === req.user.email){
        imageOSS.openVip(req.user.username, function (err) {
            if(err){
                res.json({status: "error"});
                throw err;
            }
            res.json({status: "success"});
        });
    }else{
        res.json({status: "error", msg:"邮箱不正确"});
    }
});

router.post('/vip/close', function (req, res) {
    let email = req.body.email;
    console.log(email);
    if(email === req.user.email){
        imageOSS.closeVip(req.user.username, function (err) {
            if(err){
                res.json({status: "error"});
                throw err;
            }
            res.json({status: "success"});
        });
    }else{
        res.json({status: "error", msg:"邮箱不正确"});
    }
});

router.post('/delete/image', function (req, res) {
    let uuid = req.body.uuid;
    let albumname = req.body.albumname;
    console.log(req.body);
    imageOSS.deleteImage(req.user.username, albumname, uuid, function (err) {
        if(err){
            res.json({ status: 'error', msg: err });
            throw err;
        }
        res.json({ status: 'success', msg: '删除成功' });
    });
});

router.post('/delete/batchimage', function (req, res) {
    let uuids = JSON.parse(req.body.uuids);
    let albumname = req.body.albumname;
    console.log("batch delete image", uuids, albumname);
    imageOSS.deleteBatchImage(req.user.username, albumname, uuids, function (err) {
        if(err){
            res.json({ status: 'error', msg: err });
            throw err;
        }
        res.json({ status: 'success', msg: '删除成功' });
    });
});

router.post('/info/tag', function (req, res) {
   console.log(req.body);
   if(req.body.type === 'add'){
       // 添加标签
       imageOSS.addTag(req.user.username, req.body.tag, function (err) {
           if(err){
               res.json({ status: 'error', msg: err});
               throw err;
           }
           res.json({ status: 'success'});
       });
   }else{
       // 删除标签
       imageOSS.removeTag(req.user.username, req.body.tag, function (err) {
           if(err){
               res.json({ status: 'error', msg: err});
               throw err;
           }
           res.json({ status: 'success'});
       });
   }
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}

module.exports = router;