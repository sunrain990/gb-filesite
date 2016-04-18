/**
 * Created by kevin on 15/12/1.
 */
var http = require('http');

var qs = require('querystring');

var data = {
    id:'z0.56ca7ef87823de31886cdb2b'
};//这是需要提交的数据


var content = qs.stringify(data);

var options = {
    hostname: 'api.qiniu.com',
    port: 80,
    path: '/status/get/prefop?' + content,
    method: 'GET'
};

var req = http.request(options, function (res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
    });
});

req.on('error', function (e) {
    console.log('problem with request: ' + e.message);
});

req.end();