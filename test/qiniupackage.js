/**
 * Created by kevin on 15/11/30.
 */
var qiniu = require('qiniu');
var http = require('http');
var BUCKET = 'geminno';
var util = require('util');
var crypto = require('crypto');
qiniu.conf.ACCESS_KEY = 'IEnRwqovf--MWYbgsVFZuWgWcsLw-B0k442PB7OJ';
qiniu.conf.SECRET_KEY = 'yG59rt6ci8WRFGaI6OLDjtx8zRxtGZZcqb7bFX0V';

var putPolicy = new qiniu.rs.PutPolicy(
    BUCKET
);
var uptoken = putPolicy.token();

//var client = new qiniu.rs.Client();

var b = new Buffer('http://7xnmfe.com1.z0.glb.clouddn.com/scorn1.gif');
var s = b.toString('base64');
console.log(s,'this to 64');
//
//var c = new Buffer('aHR0cDovL3Bob3RvaWQucWluaXVkbi5jb20vRmthb0djSG1WMm93T1FuT0RZUGJ2dEtqck9HSz92PTE0MjIyNDYzNjkmZT0xNDIyMjQ5OTY5JnRva2VuPTJrZ2s2T3djSkRaWTVMY1M3Rm8xSF95dXB1VEFpX3ZSQzVlZHNkWHI6Z3pHZC1La2s1aWNzd3VRN3ZzOEdJcDJfeVNjPQ==/alias/MzcyMTU1NjcyNy5qcGc=|saveas/cGhvdG9pZDoyMDE1MTgwMDAwNS56aXA=','base64');
//var d = c.toString('utf8');
//var e = decodeURIComponent('mkzip%2f2%2furl%2faHR0cDovL3Fpbml1cGhvdG9zLnFpbml1ZG4uY29tL2dvZ29waGVyLmpwZw==%2furl%2faHR0cDovL2RldmVsb3Blci5xaW5pdS5jb20vcmVzb3VyY2UvZGl2ZS1pbnRvLWdvbGFuZy5wcHR4%2falias%2fZ29sYW5nLnBwdHg=%2faHR0cDovL29wZW4ucWluaXVkbi5jb20vdGhpbmtpbmctaW4tZ28ubXA0%7csaveas%2fdGVzdDp0ZXN0LnppcA==');
//var f = new Buffer('Z29sYW5nLnBwdHg=','base64');
//var g = new Buffer('aHR0cDovL29wZW4ucWluaXVkbi5jb20vdGhpbmtpbmctaW4tZ28ubXA0','base64');
////console.log(d,e);
//console.log(e);
//console.log(f.toString());
//console.log(g.toString());

//client.remove(BUCKET,'userid1_scheduleid3045M_M/20130711104722583.jpg',function(err,ret){
//    if(!err){
//        console.log(ret);
//    }else{
//        console.log(err);
//    }
//});

//  mkzip/2
//  /url/
//     http://qiniuphotos.qiniudn.com/gogopher.jpg
//  /url/
//     http://developer.qiniu.com/resource/dive-into-golang.pptx
//  /alias/ golang.pptx/
//     http://open.qiniudn.com/thinking-in-go.mp4
//  |saveas/ test:test.zip


var qiniu = require('qiniu'),
    config = require('../config');

qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.SECRET_KEY;
var uptoken = new qiniu.rs.PutPolicy(config.Bucket_Name);
var token = uptoken.token();

var http = require('http');
var qs = require('querystring');

//var b = new Buffer('userid1_scheduleid3045M_M/叶根友毛笔行书2.0.rar');
//var s = b.toString('base64');
//console.log(s,'this base64ed!');
//var a = new Buffer('bmV3ZG9jczpmaW5kX21hbi50eHQ=/bmV3ZG9jczpmaW5kLm1hbi50eHQ=','base64');
//console.log(a.toString());
//
//PutPolicy.prototype.token = function(mac) {
//    if (mac == null) {
//        mac = new Mac(conf.ACCESS_KEY, conf.SECRET_KEY);
//    }
//    var flags = this.getFlags();
//    var encodedFlags = util.urlsafeBase64Encode(JSON.stringify(flags));
//    var encoded = util.hmacSha1(encodedFlags, mac.secretKey);
//    var encodedSign = util.base64ToUrlSafe(encoded);
//    var uploadToken = mac.accessKey + ':' + encodedSign + ':' + encodedFlags;
//    return uploadToken;
//}


var hmacSha1 = function(encodedFlags, secretKey) {
    /*
     *return value already encoded with base64
     * */
    var hmac = crypto.createHmac('sha1', secretKey);
    hmac.update(encodedFlags);
    return hmac.digest('base64');
};

var base64ToUrlSafe = function(v) {
    return v.replace(/\//g, '_').replace(/\+/g, '-');
};

var urlsafeBase64Encode = function(jsonFlags) {
    var encoded = new Buffer(jsonFlags).toString('base64');
    return base64ToUrlSafe(encoded);
};

var url = 'http://7xnmfe.com1.z0.glb.clouddn.com/2016-01-06-21-44-50读影随行(内测版)原型图.zip';
//var url1 = 'http://7xnmfe.com1.z0.glb.clouddn.com/userid1_scheduleid3045M_M/叶根友毛笔行书2.0.rar';
var saveas = 'geminno:lalalatestzip.zip';
var post_data = {
    bucket:'geminno',
    key:'suninit',
    fops:'mkzip/2/url/'+urlsafeBase64Encode(url)+'|saveas/'+urlsafeBase64Encode(saveas)
    //|saveas/Z2VtaW5ubzp0dHQuemlw
    //fops:'mkzip/2/url/aHR0cDovLzd4bm1mZS5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS91c2VyaWQxX3NjaGVkdWxlaWQzMDQ1TV9NL+WPtuagueWPi+avm+eslOihjOS5pjIuMC5yYXI='
};

console.log(post_data.fops);

var content = qs.stringify(post_data);
console.log(content,'this is content');

//  /move/newdocs:find_man.txt
var signingStr = '/pfop/\n'+content;
var sign = hmacSha1(signingStr,config.SECRET_KEY);
var encodedSign = base64ToUrlSafe(sign);
var accessToken = config.ACCESS_KEY+':'+encodedSign;
console.log(accessToken,'this is token!!!');

var post_options = {
    host: 'api.qiniu.com',
    port: '80',
    path: '/pfop/',
    method: 'post',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'QBox '+ accessToken
    }
};

console.log('token--------->',post_options.headers.Authorization);

// Set up the request
var post_req = http.request(post_options, function(res) {
    res.setEncoding('utf8');
    console.log('STATUS: '+res.statusCode);
    //console.log(res);
    console.log('HEADERS:' + JSON.stringify(res.headers));

    res.on('data', function (chunk) {

        console.log('BODY: ' + chunk);
    });
});
console.log(JSON.stringify(post_req.headers));


post_req.on('error',function(e){
    console.log('problem with request: '+e.message);
});
// post the data
post_req.write(content);
//post_req.write(post_data);
post_req.end();