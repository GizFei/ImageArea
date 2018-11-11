// Multer 不会处理任何非 multipart/form-data 类型的表单数据。
// !!!不要忘记enctype="multipart/form-data"你的形式。
const express = require('express');
const router = express.Router();
const multer = require('multer');
const formidable = require('formidable');
const path = require('path');
const imageOSS = require('../models/imageAreaOSS');
const profileOSS = require('../models/profileOSS');

const upload = multer({
    dest: './uploads'
}); //.array('images', 5);  // 上传文件存放地

router.get('*', ensureAuthenticated, function (req, res, next) {
    profileOSS.getProfileImage(req.user.id, function (err, url) {
        if(err) throw err;
        console.log("upload pages", url);
        req.profile = url;
        next();
    });
});

router.get('/images', function (req, res) {
    imageOSS.getTagsAndAlbums(req.user.username, function (err, info) {
        console.log(info);
        res.render('upload', {profile: req.profile, tags: info.tags, albums: info.albums});
    });
});

router.post('/images',function (req, res) {
    // let file = (JSON.parse(req.body.data))[0].file;
    // let info = JSON.parse(req.body.imageinfo);
    // console.log("file", req.files);
    // let images = [];

    try {
        // res.setHeader("Access-Control-Allow-Origin", "*");
        let form = formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, '../uploads');
        form.keepExtensions = true;
        form.encoding = "utf-8";
        console.log(form);
        form.onPart = function (part) {
            // console.log("part", part);
            if (part.filename !== '') {
                form.handlePart(part);
            }
        };
        form.parse(req, function (err, fields, files) {
            console.log(err);
            if (err) throw err;
            // console.log("files", files);
            // console.log("fields", fields);
            let images = [];
            for(let i = 0; i < parseInt(fields.num); i++){
                let info = JSON.parse(fields["info" + i]);
                let file = files['img' + i];
                let image = {
                    name: info.name,
                    path: file.path,
                    tags: info.tags,
                    business: info.business,        // 是否商用，true或false
                    download: info.download,        // 是否能下载，true或false
                    album: info.album,              // 所在相册
                    date: info.date                 // 上传时间
                };
                console.log(image);
                images.push(image);
            }

            imageOSS.uploadImages(req.user.username, images, function (err) {
                console.log(req.user.username);
                console.log(err);
                if(err){
                    // req.flash('error', "未知错误，报告后台");
                    // res.location('/upload/images');
                    // res.redirect('/upload/images');
                    res.json({status: "error"});
                    console.log(err);
                }else{
                    res.json({status: "success"});
                }
            });
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/batchimages', function (req, res) {
    imageOSS.getTagsAndAlbums(req.user.username, function (err, info) {
        console.log(info);
        res.render('batchupload', {profile: req.profile, tags: info.tags, albums: info.albums});
    });
});

router.post('/batchimages', function (req, res) {
    try {
        // res.setHeader("Access-Control-Allow-Origin", "*");
        let form = formidable.IncomingForm();
        form.uploadDir = path.join(__dirname, '../uploads');
        form.keepExtensions = true;
        form.encoding = "utf-8";
        console.log(form);
        form.onPart = function (part) {
            // console.log("part", part);
            if (part.filename !== '') {
                form.handlePart(part);
            }
        };
        form.parse(req, function (err, fields, files) {
            console.log(err);
            if (err) throw err;
            // console.log("files", files);
            console.log("fields", fields);
            let images = [];
            let info = {
                name: fields['name'],
                album: fields['album'],
                tags: JSON.parse(fields['tags']),
                business: fields['business'],
                download: fields['download'],
                date: fields['date']
            };
            for(let i = 0; i < parseInt(fields.num); i++){
                let file = files['img' + i];
                let image = {
                    name: info.name + "_" + i,
                    path: file.path,
                    tags: info.tags,
                    business: info.business,        // 是否商用，true或false
                    download: info.download,        // 是否能下载，true或false
                    album: info.album,              // 所在相册
                    date: info.date                 // 上传时间
                };
                console.log("BatchUpload image", image);
                images.push(image);
            }

            imageOSS.uploadImages(req.user.username, images, function (err) {
                console.log(req.user.username);
                console.log(err);
                if(err){
                    // req.flash('error', "未知错误，报告后台");
                    // res.location('/upload/images');
                    // res.redirect('/upload/images');
                    res.json({status: "error"});
                    console.log(err);
                }else{
                    res.json({status: "success"});
                }
            });
        });
    } catch (e) {
        console.log(e);
    }
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}

module.exports = router;
