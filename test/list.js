/**
 * Created by kevin on 15/12/18.
 */
var qiniu = require('qiniu');
var http = require('http');
var qs = require('querystring');
var config = require('../config');
var BUCKET = 'geminno';
var util = require('util');
var crypto = require('crypto');
//qiniu.conf.ACCESS_KEY = 'IEnRwqovf--MWYbgsVFZuWgWcsLw-B0k442PB7OJ';
//qiniu.conf.SECRET_KEY = 'yG59rt6ci8WRFGaI6OLDjtx8zRxtGZZcqb7bFX0V';

var post_data = {
    bucket:'geminno'
};


var content = qs.stringify(post_data);
console.log(content,'this is content');


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



//  /move/newdocs:find_man.txt
var signingStr = '/list?\n'+content;
console.log(signingStr,'this is signingstr');
var sign = hmacSha1(signingStr,config.SECRET_KEY);
var encodedSign = base64ToUrlSafe(sign);
var accessToken = config.ACCESS_KEY+':'+encodedSign;
console.log(accessToken,'this is token!!!');

//
//var signingStr = '/pfop/\n'+content;
//var sign = hmacSha1(signingStr,config.SECRET_KEY);
//var encodedSign = base64ToUrlSafe(sign);
//var accessToken = config.ACCESS_KEY+':'+encodedSign;
//console.log(accessToken,'this is token!!!');

var post_options = {
    host: 'rsf.qbox.me',
    port: '80',
    path: '/list',
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
//post_req.write(post_daßta);
post_req.end();