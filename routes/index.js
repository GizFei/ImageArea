const express = require('express');
const router = express.Router();
const OSS = require('../models/profileOSS.js')

/* GET home page. */
// res.render渲染'index.pug'模板
// 路由设置，相当于flask的路由
router.get('/',ensureAuthenticated, function(req, res, next) {
    console.log("Login in");
    OSS.getProfileImage(req.user.id, function (err, url) {
        if(err) throw err;
        console.log(url);
        res.render('index', { username: req.user.username, active: "Home", profile: url});
    });
});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/users/login');
}

module.exports = router;
