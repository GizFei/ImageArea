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
    res.render('objectdetection');
});

router.post('/objectdetection', function (req, res) {
    console.log("OBJECt");
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
        console.log("files", files);
        // console.log("fields", fields);

        techOSS.detectTagsOfImage(function (err, tags) {
            console.log("tags", tags);
            res.json({tags: tags});
        });
    });
});

module.exports = router;