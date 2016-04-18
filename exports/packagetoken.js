/**
 * Created by kevin on 15/12/2.
 */
var qiniu = require('qiniu');
var http = require('http');
var crypto = require('crypto');
var qiniuconfig = require('../config');
var qs = require('querystring');
var moment = require('moment');

var BUCKET = qiniuconfig.Bucket_Name;
//var post_data = {
//    bucket:'geminno',
//    key:'孙清波2015-11-28-12-50-00scorn1.gif',
//    fops:'mkzip/2/url/aHR0cDovLzd4bm1mZS5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS9zY29ybjEuZ2lm|saveas/Z2VtaW5ubzp0dHQuemlw'
//};

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

var Packagetoken = function(result,scollectiontitle,res){
    if(result.length == 0){
        return res.json({code:1,msg:'该项目暂无人提交作业！'})
    }
    console.log('result then');
    //response.json({code:1,msg:'this is test!'});
    //fops:'mkzip/2/url/'+urlsafeBase64Encode(url)
    //var url = 'http://7xnmfe.com1.z0.glb.clouddn.com/userid1_scheduleid3045M_M/叶根友毛笔行书2.0.rar';

    var generatefop = function(arr){
        var brr = arr.map(function(e){
            return '/url/'+urlsafeBase64Encode(e.url);
        });
        var tempstr="";
        brr.forEach(function(b){
            tempstr+=b;
        });
        return tempstr;
    };

    var saveas = function(str){
        return '|saveas/'+ urlsafeBase64Encode(str)
    };

    scollectiontitle = scollectiontitle+moment().format('YYYY-MM-DD-hh-mm-ss');
    return res.json({code:1,msg:{scollectiontile:scollectiontitle}});
    console.log('then1');


    var post_data = {
        bucket:BUCKET,
        key:'suninit', //这个key必须是空间中有的文件，没有实际意义
        //fops:'mkzip/2/url/aHR0cDovLzd4bm1mZS5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS9zY29ybjEuZ2lm|saveas/Z2VtaW5ubzp0dHQuemlw'
        fops:'mkzip/2'+generatefop(result)+saveas()
    };

    console.log(post_data.fops,'this is fops');
    var content = qs.stringify(post_data);
    var signingStr = '/pfop/\n'+content;
    var sign = hmacSha1(signingStr,qiniuconfig.SECRET_KEY);
    var encodedSign = base64ToUrlSafe(sign);
    var accessToken = qiniuconfig.ACCESS_KEY+':'+encodedSign;

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

    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        //console.log('STATUS: '+res.statusCode);
        //console.log('HEADERS:' + JSON.stringify(res.headers));

        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
    });
    console.log(JSON.stringify(post_req.headers));
    post_req.on('error',function(e){
        console.log('problem with request: '+e.message);
    });
    post_req.write(content);
    post_req.end();
};

module.exports = Packagetoken;