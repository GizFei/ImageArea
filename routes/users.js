const express = require('express');
const router = express.Router();
const multer = require('multer');
const LocalStrategy = require("passport-local").Strategy;
const passport = require('passport');
const upload = multer({dest: './uploads'});
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const async = require('async');

const profileOSS = require("../models/profileOSS");
const User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function (req, res, next) {
    res.render('register', {active: 'Register'});
});

router.get('/login', function (req, res, next) {
    res.render('login', {active: 'Login'});
});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', '退出成功');
    // 重定向网址
    res.redirect('/users/login');
});

router.get('/forgot', function (req, res) {
    return res.render('forgot');
});

router.get('/reset/:token', function (req, res) {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function (err, user) {
        if(!user){
            req.flash('error', '密码重置令牌无效或过期');
            return res.redirect('/users/forgot');
        }
        console.log(user);
        res.render('reset');
    });
});

router.post('/login',
    passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: "用户名或密码输入错误"}),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        // req.flash("success", 'You are now logged in');
        res.redirect('/');
});

passport.serializeUser(function(user, done) {
    console.log("serializeUser", user);
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log("deserializeUser",id);
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(function (username, password, done) {
    User.getUserByUsername(username, function (err, user) {
        console.log("localStrategy", user);
        if(err) throw err;
        if(!user){
            return done(null, false, {message: 'Unknown user'});
        }

        User.comparePassword(password, user.password, function (err, isMatch) {
            if(err) return done(err);
            if(isMatch){
                return done(null, user)
            }else{
                return done(null, false, {message: "Invalid password"});
            }
        })
    });
}));

router.post('/register', upload.single('profile'), function (req, res, next) {
   var email = req.body.email;
   var username = req.body.username;
   var password = req.body.password;
   var password2 = req.body.password2;

   if(req.file){
       console.log('Uploading File...');
       console.log(req.file);
       var profile = req.file;
   }else{
       console.log('No File uploaded...');
       profile = 'undefinedProfile.png';
   }

   // Form validator
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    // Check Errors
    var errors = req.validationErrors();
    if(errors){
        res.render('register', {errors: errors, active: 'Register'});
        console.log('Errors');
    }else{
        var newUser = new User({
            email: email,
            username: username,
            password: password,
        });

        User.createUser(newUser, function (err) {
            if(err){
                req.flash('error', err);
                res.redirect('/users/register');
            }else{
                profileOSS.uploadProfile(newUser.id,  profile, function (err) {
                    if(err) throw err;
                });
                req.flash('success', "注册成功！");

                res.location('/');
                res.redirect('/');
            }
            console.log(newUser);
        });

        // req.flash('success', "注册成功！");
        //
        // res.location('/');
        // res.redirect('/');
    }
});

router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                let token = buf.toString('hex');
                done(err, token);
            })
        },
        function (token, done) {
            User.getUserByEmail(req.body.email, function (err, user) {
                if(!user){
                    req.flash('error', '该邮箱未被注册');
                    return res.redirect('/users/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // One hour

                user.save(function (err) {
                    done(err, token, user);
                })
            })
        },
        function (token, user, done) {
            let transporter = nodemailer.createTransport({
                service: "qq",
                auth: {
                    user: "1150847818@qq.com",
                    pass: "hzyhmxfknqorjaee"
                }
            });
            let mailOptions = {
                from: "1150847818@qq.com",
                to: user.email,
                subject: "Image Area重置密码",
                text: '点击下面的链接重置密码\nhttp://' + req.headers.host + '/users/reset/' + token + '\n\n' +
                    '如果你不想重置，请无视这个邮件'
            };

            transporter.sendMail(mailOptions, function (err, info) {
                console.log("Send email: " + info.response);
                req.flash('info', '密码重置邮件已经发送到您的邮箱，请按上面的提示重置密码');
                done(err, 'done');
            });
        }
    ], function (err) {
        if(err) return next(err);
        res.redirect('/users/login');
    })
});

router.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function (err, user) {
                if(!user){
                    req.flash('error', '密码重置令牌无效或过期');
                    return res.redirect('/users/forgot');
                }
                console.log(user);

                req.checkBody('password', 'Password field is required').notEmpty();
                req.checkBody('confirm-password', 'Passwords do not match').equals(req.body.password);

                // Check Errors
                let errors = req.validationErrors();
                if(errors){
                    res.render('reset', {errors: errors});
                    console.log('Errors', errors);
                }else{
                    user.password = req.body.password;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(user.password, salt, function(err, hash) {
                            // Store hash in your password DB.
                            user.password = hash;
                            user.save(function (err) {
                                if(err) throw err;
                                done(err, user);
                                // req.logIn(user, function (err) {
                                //     done(err, user);
                                // });
                            });
                        });
                    });
                }
            });
        },
        function (user, done) {
            req.flash('success', '修改成功');
            console.log(user);
            done(null);
        },
    ], function (err) {
        console.log(err);
        res.redirect('/');
    })
});

module.exports = router;
