/**
 * Created by kevin on 15/11/13.
 */
var express = require('express'),
    router = express.Router(),
    Model = require('../models/db'),
    crypto = require('crypto'),
    TITLE_LOGIN = '登录';


router.post('/', function(req, res,next) {
    console.log(req.session.username,'---------->');
    var userName = req.body['username'],
        userPwd = req.body['pass'],
        md5 = crypto.createHash('md5');

    if(userPwd){
        userPwd = md5.update(userPwd).digest('hex');
    }
    Model.LoginModel.find({username:userName},function(err,model){
        if(err){
            console.log(err,model);
            return;
        }

        if(model.length == 1){
            if(model[0].username == userName && model[0].password == userPwd){
                //res.cookie('islogin', userName, { maxAge: 60000 });
                req.session.username = userName;
                return res.json({code:1,msg:'登录成功!'});
                //return res.redirect(302,'/login');
            }else{
                return res.json({code:-1,msg:'登录失败！用户名或密码错误！'});
            }
        }else{
            return res.json({code:-1,msg:'数据出错；用户不存在，或者超过1个！'});
        }
    });

});

module.exports = router;