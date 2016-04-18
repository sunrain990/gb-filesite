/**
 * Created by kevin on 15/11/16.
 */
var express = require('express'),
    qiniu = require('qiniu'),
    config = require('../config'),
    router = express.Router();

qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.SECRET_KEY;
var uptoken = new qiniu.rs.PutPolicy(config.Bucket_Name);


router.get('/',function(req,res){
    var token = uptoken.token();
    res.header("Cache-Control", "max-age=0, private, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    if (token) {
        res.json({
            uptoken: token
        });
    }
});


module.exports = router;