/**
 * Created by kevin on 15/11/13.
 */
var express = require('express'),
    router = express.Router(),
    Model = require('../models/db'),
    crypto = require('crypto'),
    TITLE_REG = '注册';

//router.get('/', function(req, res) {
//    res.render('reg',{title:TITLE_REG});
//});

router.post('/', function(req, res) {
    console.log(req.session.username,'<----------');
    var userName = req.body['username'],
        userPwd = req.body['pass'],
        userRePwd = req.body['pass1'],
        md5 = crypto.createHash('md5');
    if(!userPwd){
        res.json({code:-1,msg:'密码未设置'});
    }
    userPwd = md5.update(userPwd).digest('hex');

    Model.LoginModel.find({username:userName},function(err,model){
        if(err){
            console.log(err,model);
            return;
        }

        if(model.length == 0){

            var doc = {
                username:userName,
                password:userPwd
            };

            new Model.LoginModel(doc).save(function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log('用户注册OK!');
                }
            });
            res.json({code:1,msg:'用户注册OK!'});
            return;
        }else{
            res.json({code:-1,msg:'用户名存在！'});
            return;
        }
    });

    //检查用户名是否已经存在

});

module.exports = router;