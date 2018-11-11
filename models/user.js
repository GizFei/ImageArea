const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const imageOSS = require('./imageAreaOSS.js');

mongoose.connect("mongodb://localhost/image-area", {
    useNewUrlParser: true
});

var db = mongoose.connection;
var UserSchema = mongoose.Schema({
   username: {
       type: String,
       required: true,
       unique: true,
       index: true
   },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
};

module.exports.getUserByUsername = function(username, callback){
    var query = {username: username};
    User.findOne(query, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        callback(null, isMatch);
    });
};

module.exports.getUserByEmail = function(email, callback){
    User.findOne({'email': email}, callback);
};

module.exports.queryUsersByLike = function(query, callback){
    let like = {
        username: new RegExp(query)
    };
    User.find(query, callback);
};

module.exports.createUser = function (newUser, callback) {
    User.ifUserNameExists(newUser.username, function (err, ifExists) {
        if(ifExists){
            callback(err);
        }else{
            User.ifEmailUsed(newUser.email, function(err, ifUsed){
                if(ifUsed){
                    callback(err);
                }else{
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(newUser.password, salt, function(err, hash) {
                            // Store hash in your password DB.
                            newUser.password = hash;
                            imageOSS.createUserArea(newUser, function (err, msg) {
                                if(err){
                                    console.log("createUserArea", err);
                                }
                            });
                            newUser.save(callback);
                        });
                    });
                }
            });
        }
    });
};

module.exports.ifUserNameExists = function (username, callback) {
    User.find({'username': username}, function (err, result) {
        if(result.length > 0){
            callback("用户名已被注册", true);
        }else{
            callback(null, false);
        }
    });
};

module.exports.ifEmailUsed = function(email, callback){
    User.find({'email': email}, function (err, result) {
        if(result.length > 0){
            callback("邮箱已被注册", true);
        }else{
            callback(null, false);
        }
    });
};

// function testFind() {
//     User.find({'username': 'kkk'}, function (err, msg) {
//         console.log(msg);
//     });
// }

// testFind();