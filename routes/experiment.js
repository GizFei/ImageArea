const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const path = require('path');
const techOSS = require('../models/technologyOSS');

router.get('/tagcloud', function (req, res) {
    // techOSS.getAllTags(function (err, tags) {
    //     res.render('tagcloud', { tags: tags });
    // });
    techOSS.getAllTagsWithFreq(function (err, tags) {
        console.log(tags);
        res.render('tagcloud', { tags: tags });
    })
});

router.get('/objectdetection', function (req, res) {
    if(req.isAuthenticated()){
        techOSS.getUserInfo(req.user.username, function (err, avatar) {
            res.render('detectionupload', { profile: avatar });
        });
    }else{
        res.redirect('/users/login');
    }
});
router.get('/dusingle', function (req, res) {
    if(req.isAuthenticated()){
        techOSS.getUserInfo(req.user.username, function (err, avatar) {
            res.render('dusingle', { profile: avatar });
        });
    }else{
        res.redirect('/users/login');
    }
});

router.post('/objectdetection', function (req, res) {
    let form = formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../detection');
    form.keepExtensions = true;
    form.encoding = "utf-8";
    form.onPart = function (part) {
        // console.log("part", part);
        if (part.filename !== '') {
            form.handlePart(part);
        }
    };
    form.parse(req, function (err, fields, files) {
        console.log(err);
        if (err) throw err;
        console.log("files", files['image0']);
        console.log("fields", fields);
        let theFiles = [];
        for(let i = 0; i < Object.keys(files).length; i++){
            theFiles.push(files["image" + i].path);
        }
        console.log(theFiles);

        techOSS.detectTagsOfImage(theFiles, function (err, tags) {
            console.log("tags", tags);
            res.json({tags: tags});
        });
    });
});
router.post('/detectionrelatively', function (req, res) {
    let form = formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '../detection');
    form.keepExtensions = true;
    form.encoding = "utf-8";
    form.onPart = function (part) {
        // console.log("part", part);
        if (part.filename !== '') {
            form.handlePart(part);
        }
    };
    form.parse(req, function (err, fields, files) {
        console.log(err);
        if (err) throw err;
        console.log("files", files['image0']);
        console.log("fields", fields);
        let theFiles = [];
        for(let i = 0; i < Object.keys(fields).length; i++){
            theFiles.push({
                name: fields["imgName" + i],
                path: files["image" + i].path
            });
        }
        console.log(theFiles);

        techOSS.detectTagsOfImageRelatively(theFiles, function (err, result) {
            console.log("tags", result);
            res.json({result: result});
        });
    });
});

module.exports = router;