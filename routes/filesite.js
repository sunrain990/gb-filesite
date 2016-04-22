/**
 * Created by kevin on 15/11/13.
 */
var express = require('express'),
    qiniu = require('qiniu'),
    //config = require('../config'),
    crypto = require('crypto'),
    https = require('https'),
    Mysql = require('../models/my'),
    router = express.Router();
var iconv = require('iconv-lite');
//var packagetoken = require('../exports/packagetoken');
var http = require('http');

var qs = require('querystring');
var moment = require('moment');
var qiniuconfig = require('../config');


var BUCKET = qiniuconfig.Bucket_Name;

qiniu.conf.ACCESS_KEY = qiniuconfig.ACCESS_KEY;
qiniu.conf.SECRET_KEY = qiniuconfig.SECRET_KEY;
//DOMAIN="7xnmfe.com1.z0.glb.clouddn.com"

var client = new qiniu.rs.Client();

var putPolicy = new qiniu.rs.PutPolicy(
    BUCKET
);
var uptoken = putPolicy.token();


var transDir = function(currentDirs,currentDir){
    var indexOfSlash = currentDirs.indexOf('/');
    var dir1 = currentDirs.substr(indexOfSlash+1);
    return dir1.split('/');
};


router.post('/getmyfilelist',function(req,res,next){
    var scheduleid = req.body.scheduleid;
    if(scheduleid == undefined){
        return res.json({code:-1,msg:'scheduleid未定义！'});
    }
    var selectSQL = 'select * from file where id=(select file from schedule where id='+scheduleid+')';
    Mysql.project.query(selectSQL,function(err,rows){
        if (!err){
            console.log("SELECT ==> ",rows);
            if(rows.length>0){
                var result = rows[0];
                var returnjson = {
                    file:result.file,
                    url:result.url
                };
                return res.json({code:1,msg:'查询成功！',data:{children:[returnjson]}});
            }else{
                return res.json({code:1,msg:'查询成功！',data:{}});
            }
        }else{
            console.log(err);
            return res.json({code:1,msg:'查询失败！'});
        }
    });
});


router.post('/testpost',function(req,res,next){
    console.log('testpost!!!!',req.body.id,req.body.code,req.body.desc);
    if(req.body.code == 0){
        req.io.emit('testpost',{
            persistentId:req.body.id
        });
    }
    res.json({code:1,data:'many3ks'});
});

router.post('/docspacked',function(req,res,next){
    console.log('docspacked!!!!',req.body.id,req.body.code,req.body.desc);
    if(req.body.code == 0){
        req.io.emit('docspacked',{
            persistentId:req.body.id
        });
    }
    res.json({code:1,data:'many3ksdoc'});
});

router.post('/filespacked',function(req,res,next){
    console.log('filespacked!!!!',req.body.id,req.body.code,req.body.desc);
    if(req.body.code == 0){
        req.io.emit('filespacked',{
            persistentId:req.body.id
        });
    }
    res.json({code:1,data:'many3ksfile'});
});


router.post('/getfilelist',function(req,res,next){
    var userName;
    if(req.body.username){
        userName = req.body.username;
    }else{
        userName = req.session.username;
    }
    var scheduleid = req.body.scheduleid;
    var prefix = userid + '_'+ scheduleid;
    console.log(userName,scheduleid);
    var query={username:userName};

    Model.LoginModel.findOne(query,function(err,doc){
        if(err){
            return res.json({code:-1,msg:'后台错误！'});
        }else if(!doc){
            return res.json({code:-1,msg:'返回列表失败！',data:{children:[]}});
        }else{
            var jieminuo;
            if(doc.dir[0]['children'].length>0){
                for(var i=0;i<doc.dir[0]['children'].length;i++){
                    if(doc.dir[0]['children'][i]['name'] == '（杰米诺）'){
                        jieminuo = doc.dir[0]['children'][i];
                    }
                }
                if(scheduleid&&jieminuo['children'].length>0){
                    for(var i=0;i<jieminuo['children'].length;i++){
                        jieminuo['children'][i]['name']
                    }
                }

                var filtered = jieminuo['children'].filter(function(child){
                    console.log(child,'this is child',child['url'].indexOf('http://7xnmfe.com1.z0.glb.clouddn.com/'+userName+'_'+scheduleid),'http://7xnmfe.com1.z0.glb.clouddn.com/'+userName+'_'+scheduleid);

                    return child['url'].indexOf('http://7xnmfe.com1.z0.glb.clouddn.com/'+userName+'_'+scheduleid) != -1;
                });

                jieminuo['children'] = filtered;

                return res.json({code:1,msg:'返回列表成功！',data:jieminuo});
            }else{
                return res.json({code:-1,msg:'返回列表失败！',data:{children:[]}});
            }
        }
    });


});


router.post('/rmmyfile',function(req,res,next){
    var scheduleid = req.body.scheduleid;
    var userid = req.body.userid;
    Mysql.project.query('select authorid from schedule where id='+scheduleid,function(err,result){
        if(!err){
            if(result[0].authorid == userid){
                var updateSQL = 'UPDATE schedule set file='+0+' where id='+scheduleid;
                Mysql.project.query(updateSQL,function(err,result){
                    if(!err){
                        if(result.changedRows == 1){
                            res.json({code:1,msg:'删除成功！',data:{}});
                        }
                    }else{
                        res.json({code:1,msg:'删除失败！'});
                    }
                });
            }else{
                res.json({code:-1,msg:'非用户本人删除！'});
            }
        }else{
            res.json({code:-1,msg:err});
        }
    });
});

router.post('/packageall',function(req,res,next){
    var scollectionid = req.body.scollectionid;
    var scollectiontitle = req.body.scollectiontitle;

    //select url from file where id in (select file from schedule where id in (select scheduleid from scollection_schedule where scollectionid=7))
    var querydownnames = 'select url from file where id in (select file from schedule where id in (select scheduleid from scollection_schedule where scollectionid='+scollectionid+'))';
    Mysql.project.query(querydownnames,function(err,result){
        if(!err){

            if(result.length == 0){
                return res.json({code:1,msg:'该项目暂无人提交作业！'})
            }
            console.log('result then');
            //response.json({code:1,msg:'this is test!'});
            //fops:'mkzip/2/url/'+urlsafeBase64Encode(url)
            //var url = 'http://7xnmfe.com1.z0.glb.clouddn.com/userid1_scheduleid3045M_M/叶根友毛笔行书2.0.rar';

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

            scollectiontitle = scollectiontitle+moment().format('YYYY-MM-DD-hh-mm-ss')+'.zip';
            console.log('then1');

            result.forEach(function(i){
                console.log(i,'this is resulti');
            })

            var post_data = {
                bucket:'geminno',
                key:'suninit', //这个key必须是空间中有的文件，没有实际意义
                //fops:'mkzip/2/url/aHR0cDovLzd4bm1mZS5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS9zY29ybjEuZ2lm|saveas/Z2VtaW5ubzp0dHQuemlw'
                fops:'mkzip/2'+generatefop(result)+saveas('geminno:'+scollectiontitle)
                ,
                pipeline:'myqueue',
                notifyURL:'http://121.41.41.46:8000/filesite/testpost'
                //notifyURL:'http://121.41.123.2:8000/filesite/testpost'
            };



            console.log(post_data.fops,BUCKET,'this is fops');
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

            var post_req = http.request(post_options, function(response) {
                response.setEncoding('utf8');
                //console.log('STATUS: '+res.statusCode);
                //console.log('HEADERS:' + JSON.stringify(res.headers));

                response.on('data', function (chunk) {
                    console.log('BODY: ',chunk);
                    var jsontmp = eval("("+chunk+")");
                    console.log(jsontmp);
                    res.json({code:1,msg:'打包请求成功！',data:{
                        downurl:'http://7xnmfe.com1.z0.glb.clouddn.com/'+scollectiontitle,
                        persistentId:jsontmp.persistentId
                    }});
                });
            });
            console.log(JSON.stringify(post_req.headers));
            post_req.on('error',function(e){
                console.log('problem with request: '+e.message);
                return res.json({code:-1,msg:'problem with request: '+e.message});
            });
            post_req.write(content);
            post_req.end();


        }else{
            res.json({code:-1,msg:err});
        }
    });
});

//router.post('/packageallfiles',function(req,res,next){
//    var scollectionid = req.body.scollectionid;
//    if(scollectionid == undefined){
//        return res.json({code:-1,text:'请传入scollectionid',data:{}});
//    }
//    var scollectiontitle = req.body.scollectiontitle;
//
//    Mysql.project.query("select file from schedule where id in (select scheduleid from scollection_schedule where scollectionid="+scollectionid+")",function(err,result){
//        console.log(result,'--------------------- - - - - -- - - -- ');
//        if(result.length != 0){
//            var rere = result.filter(function(resulti){
//                return resulti.file>0;
//            });
//            if(rere.length!=0){
//
//                Mysql.project.query('select file,title from scollection where id='+scollectionid,function(err,result){
//                    console.log(result,'this is result');
//                    if(result.length != 0){
//                        var result0 = result[0];
//                        scollectiontitle = result0.title;
//                        if(result0.file == 0){
//                            //return res.json({code:1,data:'有新的上传文件，需要重新打包！'});
//                            //package();
//                        }else{
//                            console.log(result0.file,'this is result0.file');
//                            Mysql.project.query('select * from file where id="'+result0.file+'"',function(err,result){
//                                if(!err){
//                                    console.log(result,'this is exsit file');
//                                    res.json(
//                                        {
//                                            code:1,text:'没有最近新上传文件，无需重新打包！',
//                                            data:{
//                                                file:result[0],
//                                                type:0
//                                            }
//                                        });
//                                }else{
//                                    res.json({code:-1,text:'查询file出错！',data:{}});
//                                }
//                            });
//                            //return res.json({code:1,data:{doc:result0.file},text:'已打包且最近无人提交！'});
//                        }
//                    }else{
//                        return res.json({code:-1,data:{},text:'没有该作业！'});
//                    }
//                });
//
//            }else{
//                console.log('没有任何上传file文件1');
//                res.json({code:-1,text:'没有任何上传file文件'});
//            }
//        }else{
//            console.log('没有任何上传file文件');
//            res.json({code:-1,text:'没有任何上传file文件'});
//        }
//    });
//
//
//
//
//
//    function package(){
////select url from file where id in (select file from schedule where id in (select scheduleid from scollection_schedule where scollectionid=7))
//        var querydownnames = 'select url from file where id in (select file from schedule where id in (select scheduleid from scollection_schedule where scollectionid='+scollectionid+'))';
//        Mysql.project.query(querydownnames,function(err,result){
//            if(!err){
//
//                if(result.length == 0){
//                    return res.json({code:1,text:'该项目暂无人提交作业！'})
//                }
//                //response.json({code:1,msg:'this is test!'});
//                //fops:'mkzip/2/url/'+urlsafeBase64Encode(url)
//                //var url = 'http://7xnmfe.com1.z0.glb.clouddn.com/userid1_scheduleid3045M_M/叶根友毛笔行书2.0.rar';
//
//                var hmacSha1 = function(encodedFlags, secretKey) {
//                    /*
//                     *return value already encoded with base64
//                     * */
//                    var hmac = crypto.createHmac('sha1', secretKey);
//                    hmac.update(encodedFlags);
//                    return hmac.digest('base64');
//                };
//
//                var base64ToUrlSafe = function(v) {
//                    return v.replace(/\//g, '_').replace(/\+/g, '-');
//                };
//
//                var urlsafeBase64Encode = function(jsonFlags) {
//                    var encoded = new Buffer(jsonFlags).toString('base64');
//                    return base64ToUrlSafe(encoded);
//                };
//
//                var generatefop = function(arr){
//                    var brr = arr.map(function(e){
//                        return '/url/'+urlsafeBase64Encode(e.url);
//                    });
//                    var tempstr="";
//                    brr.forEach(function(b){
//                        tempstr+=b;
//                    });
//                    return tempstr;
//                };
//
//                var saveas = function(str){
//                    return '|saveas/'+ urlsafeBase64Encode(str)
//                };
//
//                scollectiontitle = scollectiontitle+moment().format('YYYY-MM-DD-hh-mm-ss')+'files.zip';
//                console.log('then1');
//
//                result.forEach(function(i){
//                    console.log(i,'this is resulti');
//                })
//
//                var post_data = {
//                    bucket:'geminno',
//                    key:'suninit', //这个key必须是空间中有的文件，没有实际意义
//                    //fops:'mkzip/2/url/aHR0cDovLzd4bm1mZS5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS9zY29ybjEuZ2lm|saveas/Z2VtaW5ubzp0dHQuemlw'
//                    fops:'mkzip/2'+generatefop(result)+saveas('geminno:'+scollectiontitle)
//                    ,
//                    notifyURL:'http://121.41.41.46:8000/filesite/filespacked'
//                    //notifyURL:'http://121.41.123.2:8000/filesite/testpost'
//                };
//
//
//
//                console.log(post_data.fops,BUCKET,'this is fops');
//                var content = qs.stringify(post_data);
//                var signingStr = '/pfop/\n'+content;
//                var sign = hmacSha1(signingStr,qiniuconfig.SECRET_KEY);
//                var encodedSign = base64ToUrlSafe(sign);
//                var accessToken = qiniuconfig.ACCESS_KEY+':'+encodedSign;
//
//                var post_options = {
//                    host: 'api.qiniu.com',
//                    port: '80',
//                    path: '/pfop/',
//                    method: 'post',
//                    headers: {
//                        'Content-Type': 'application/x-www-form-urlencoded',
//                        Authorization: 'QBox '+ accessToken
//                    }
//                };
//
//                var post_req = http.request(post_options, function(response) {
//                    response.setEncoding('utf8');
//                    //console.log('STATUS: '+res.statusCode);
//                    //console.log('HEADERS:' + JSON.stringify(res.headers));
//
//                    response.on('data', function (chunk) {
//                        console.log('BODY: ',chunk);
//                        var jsontmp = eval("("+chunk+")");
//                        console.log(jsontmp);
//                        //新建file对象
//                        var msg = {
//                            file:scollectiontitle,
//                            url:'http://7xnmfe.com1.z0.glb.clouddn.com/'+scollectiontitle
//                        };
//                        Mysql.project.query('INSERT INTO file SET ?',msg,function(err,result){
//                            if(!err){
//                                console.log('this is fileresult --------->',result);
//
//                                var update = {
//                                    file:result.insertId
//                                };
//                                Mysql.project.query('UPDATE scollection SET ? where id="'+scollectionid+'"',update,function(err,re){
//                                    if(!err){
//                                        console.log('this is projectresult------->',re);
//
//                                        res.json({code:1,text:'打包请求成功！',data:{
//                                            downurl:'http://7xnmfe.com1.z0.glb.clouddn.com/'+scollectiontitle,
//                                            persistentId:jsontmp.persistentId,
//                                            //打包中
//                                            type:1
//                                        }});
//                                    }else{
//                                        res.json({code:-1,text:'更新作业file出错'});
//                                    }
//                                });
//                            }else{
//                                res.json({code:-1,text:'生成文件对象出错'})
//                            }
//                        });
//                    });
//                });
//                console.log(JSON.stringify(post_req.headers));
//                post_req.on('error',function(e){
//                    console.log('problem with request: '+e.message);
//                    return res.json({code:-1,text:'problem with request: '+e.message});
//                });
//                post_req.write(content);
//                post_req.end();
//
//
//            }else{
//                res.json({code:-1,text:err});
//            }
//        });
//    }
//
//});

router.post('/packageallfiles',function(req,res,next){
    var scollectionid = req.body.scollectionid;
    if(scollectionid == undefined){
        return res.json({code:-1,text:'请传入scollectionid',data:{}});
    }
    var scollectiontitle = req.body.scollectiontitle;

    Mysql.project.query("select file from schedule where id in (select scheduleid from scollection_schedule where scollectionid="+scollectionid+")",function(err,result){
        console.log(result,'--------------------- - - - - -- - - -- ');
        if(result.length != 0){
            var rere = result.filter(function(resulti){
                return resulti.file>0;
            });
            console.log('this is rere!!!!,rere',rere);
            if(rere.length!=0){

                Mysql.project.query('select file,title from scollection where id='+scollectionid,function(err,result){
                    console.log(result,'this is result');
                    if(result.length != 0){
                        var result0 = result[0];
                        scollectiontitle = result0.title;
                        if(result0.file == 0){
                            //return res.json({code:1,data:'有新的上传文件，需要重新打包！'});
                            package(rere);
                        }else{
                            console.log(result0.file,'this is result0.file');
                            Mysql.project.query('select * from file where id="'+result0.file+'"',function(err,result){
                                if(!err){
                                    console.log(result,'this is exsit file');
                                    res.json(
                                        {
                                            code:1,text:'没有最近新上传文件，无需重新打包！',
                                            data:{
                                                file:result[0],
                                                type:0
                                            }
                                        });
                                }else{
                                    res.json({code:-1,text:'查询file出错！',data:{}});
                                }
                            });
                            //return res.json({code:1,data:{doc:result0.file},text:'已打包且最近无人提交！'});
                        }
                    }else{
                        return res.json({code:-1,data:{},text:'没有该作业！'});
                    }
                });

            }else{
                console.log('没有任何上传file文件1');
                res.json({code:-1,text:'没有任何上传file文件'});
            }
        }else{
            console.log('没有任何上传file文件');
            res.json({code:-1,text:'没有任何上传file文件'});
        }
    });





    function package(arr){
        var arrstr = ' (';
        for(var i=0;i<arr.length;i++){
            arrstr += arr[i]['file']+',';
        }
        arrstr = arrstr.substring(0,arrstr.length-1)+')';
        console.log(arrstr,'this is arrstr');


//select url from file where id in (select file from schedule where id in (select scheduleid from scollection_schedule where scollectionid=7))
        var querydownnames = 'select url from file where id in '+arrstr;
        Mysql.project.query(querydownnames,function(err,result){
            if(!err){

                if(result.length == 0){
                    return res.json({code:1,text:'该项目暂无人提交作业！'})
                }
                //response.json({code:1,msg:'this is test!'});
                //fops:'mkzip/2/url/'+urlsafeBase64Encode(url)
                //var url = 'http://7xnmfe.com1.z0.glb.clouddn.com/userid1_scheduleid3045M_M/叶根友毛笔行书2.0.rar';

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

                var urlsafeBase64Encode1 = function(jsonFlags) {
                    //var encoded = new Buffer(jsonFlags,'utf8').toString('base64');

                    var encoded = iconv.encode(jsonFlags, 'gbk').toString('base64');
                    return base64ToUrlSafe(encoded);
                };

                var generatefop = function(arr){
                    var brr = arr.map(function(e){
                        return '/url/'+urlsafeBase64Encode(e.url)+'/alias/'+urlsafeBase64Encode1(e.file);
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

                scollectiontitle = scollectiontitle+moment().format('YYYY-MM-DD-hh-mm-ss')+'files.zip';
                console.log('then1');

                result.forEach(function(i){
                    console.log(i,'this is resulti');
                })

                var post_data = {
                    bucket:'geminno',
                    key:'suninit', //这个key必须是空间中有的文件，没有实际意义
                    //fops:'mkzip/2/url/aHR0cDovLzd4bm1mZS5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS9zY29ybjEuZ2lm|saveas/Z2VtaW5ubzp0dHQuemlw'
                    fops:'mkzip/2'+generatefop(result)+saveas('geminno:'+scollectiontitle)
                    ,
                    pipeline:'myqueue',
                    //notifyURL:'http://121.41.41.46:8000/filesite/filespacked'
                    notifyURL:'http://121.41.123.2:8000/filesite/filespacked'
                    //notifyURL:'http://121.41.123.2:8000/filesite/testpost'
                };



                console.log(post_data.fops,BUCKET,'this is fops');
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

                var post_req = http.request(post_options, function(response) {
                    response.setEncoding('utf8');
                    //console.log('STATUS: '+res.statusCode);
                    //console.log('HEADERS:' + JSON.stringify(res.headers));

                    response.on('data', function (chunk) {
                        console.log('BODY: ',chunk);
                        var jsontmp = eval("("+chunk+")");
                        console.log(jsontmp);
                        //新建file对象
                        var msg = {
                            file:scollectiontitle,
                            url:'http://7xnmfe.com1.z0.glb.clouddn.com/'+scollectiontitle
                        };
                        Mysql.project.query('INSERT INTO file SET ?',msg,function(err,result){
                            if(!err){
                                console.log('this is fileresult --------->',result);

                                var update = {
                                    file:result.insertId
                                };
                                Mysql.project.query('UPDATE scollection SET ? where id="'+scollectionid+'"',update,function(err,re){
                                    if(!err){
                                        console.log('this is projectresult------->',re);

                                        res.json({code:1,text:'打包请求成功！',data:{
                                            downurl:'http://7xnmfe.com1.z0.glb.clouddn.com/'+scollectiontitle,
                                            persistentId:jsontmp.persistentId,
                                            //打包中
                                            type:1
                                        }});
                                    }else{
                                        res.json({code:-1,text:'更新作业file出错'});
                                    }
                                });
                            }else{
                                res.json({code:-1,text:'生成文件对象出错'})
                            }
                        });
                    });
                });
                console.log(JSON.stringify(post_req.headers));
                post_req.on('error',function(e){
                    console.log('problem with request: '+e.message);
                    return res.json({code:-1,text:'problem with request: '+e.message});
                });
                post_req.write(content);
                post_req.end();


            }else{
                res.json({code:-1,text:err});
            }
        });
    }

});




router.post('/getnums',function(req,res,next){
    var scollectionid = req.body.scollectionid;

    var sql = "select file,doc from schedule where id in (select scheduleid from scollection_schedule where scollectionid="+scollectionid+")";
    Mysql.project.query(sql,function(err,result){
        console.log(result,'--------------------- - - - - -- - - -- ');
        if(result.length !=0){
            var redoc = result.filter(function(resulti){
                return resulti.doc>0;
            });
            var refile = result.filter(function(resulti){
                return resulti.file>0;
            });

            console.log(redoc,refile);
            return res.json({code:1,text:'成功！',data:{doc:redoc.length,file:refile.length}});
        }else{
            console.log('没有任何上传file文件');
            return res.json({code:-1,text:'没有任何上传文件'});
        }
    });

});

router.post('/packagealldocs',function(req,res,next){
    var scollectionid = req.body.scollectionid;
    if(scollectionid == undefined){
        return res.json({code:-1,text:'请传入scollectionid',data:{}});
    }
    var scollectiontitle = req.body.scollectiontitle;

    Mysql.project.query("select doc from schedule where id in (select scheduleid from scollection_schedule where scollectionid="+scollectionid+")",function(err,result){
       console.log(result,'--------------------- - - - - -- - - -- ');
        if(result.length != 0){
            var rere = result.filter(function(resulti){
                return resulti.doc>0;
            });
            if(rere.length!=0){

                Mysql.project.query('select doc,title from scollection where id='+scollectionid,function(err,result){
                    console.log(result,'this is result');
                    if(result.length != 0){
                        var result0 = result[0];
                        scollectiontitle = result0.title;
                        if(result0.doc == 0){
                            //return res.json({code:1,data:'有新的上传文件，需要重新打包！'});
                            package(rere);
                        }else{
                            console.log(result0.doc,'this is result0.doc');
                            Mysql.project.query('select * from file where id="'+result0.doc+'"',function(err,result){
                                if(!err){
                                    console.log(result,'this is exsit file');
                                    res.json(
                                        {
                                            code:1,text:'没有最近新上传文件，无需重新打包！',
                                            data:{
                                                file:result[0],
                                                type:0
                                            }
                                        });
                                }else{
                                    res.json({code:-1,text:'查询file出错！',data:{}});
                                }
                            });
                            //return res.json({code:1,data:{doc:result0.file},text:'已打包且最近无人提交！'});
                        }
                    }else{
                        return res.json({code:-1,data:{},text:'没有该作业！'});
                    }
                });

            }else{
                console.log('没有任何上传doc文件1');
                res.json({code:-1,text:'没有任何上传doc文件'});
            }
        }else{
            console.log('没有任何上传doc文件');
            res.json({code:-1,text:'没有任何上传doc文件'});
        }
    });





    function package(arr){
        var arrstr = ' (';
        for(var i=0;i<arr.length;i++){
            arrstr += arr[i]['doc']+',';
        }
        arrstr = arrstr.substring(0,arrstr.length-1)+')';

//select url from file where id in (select file from schedule where id in (select scheduleid from scollection_schedule where scollectionid=7))
        var querydownnames = 'select file,url from file where id in '+arrstr;
//select url from file where id in (select file from schedule where id in (select scheduleid from scollection_schedule where scollectionid=7))
//        var querydownnames = 'select url from file where id in (select doc from schedule where id in (select scheduleid from scollection_schedule where scollectionid='+scollectionid+'))';
        Mysql.project.query(querydownnames,function(err,result){
            if(!err){

                if(result.length == 0){
                    return res.json({code:1,text:'该项目暂无人提交作业！'})
                }
                //response.json({code:1,msg:'this is test!'});
                //fops:'mkzip/2/url/'+urlsafeBase64Encode(url)
                //var url = 'http://7xnmfe.com1.z0.glb.clouddn.com/userid1_scheduleid3045M_M/叶根友毛笔行书2.0.rar';

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

                var urlsafeBase64Encode1 = function(jsonFlags) {
                    //var encoded = new Buffer(jsonFlags,'utf8').toString('base64');

                    var encoded = iconv.encode(jsonFlags, 'gbk').toString('base64');
                    return base64ToUrlSafe(encoded);
                };

                var generatefop = function(arr){
                    var brr = arr.map(function(e){
                        return '/url/'+urlsafeBase64Encode(e.url)+'/alias/'+urlsafeBase64Encode1(e.file);
                    });
                    var tempstr="";
                    brr.forEach(function(b){
                        tempstr+=b;
                    });
                    return tempstr;
                };

                var saveas = function(str){
                    return '|saveas/'+ urlsafeBase64Encode(str);
                };

                scollectiontitle = scollectiontitle+moment().format('YYYY-MM-DD-hh-mm-ss')+'docs.zip';
                console.log('then1');

                result.forEach(function(i){
                    console.log(i,'this is resulti');
                })

                var post_data = {
                    bucket:'geminno',
                    key:'suninit', //这个key必须是空间中有的文件，没有实际意义
                    //fops:'mkzip/2/url/aHR0cDovLzd4bm1mZS5jb20xLnowLmdsYi5jbG91ZGRuLmNvbS9zY29ybjEuZ2lm|saveas/Z2VtaW5ubzp0dHQuemlw'
                    fops:'mkzip/2'+generatefop(result)+saveas('geminno:'+scollectiontitle)
                    ,
                    pipeline:'myqueue',
                    //notifyURL:'http://121.41.41.46:8000/filesite/docspacked'
                    notifyURL:'http://121.41.123.2:8000/filesite/docspacked'
                    //notifyURL:'http://121.41.123.2:8000/filesite/testpost'
                };



                console.log(post_data.fops,BUCKET,'this is fops');
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

                var post_req = http.request(post_options, function(response) {
                    response.setEncoding('utf8');
                    //console.log('STATUS: '+res.statusCode);
                    //console.log('HEADERS:' + JSON.stringify(res.headers));

                    response.on('data', function (chunk) {
                        console.log('BODY: ',chunk);
                        var jsontmp = eval("("+chunk+")");
                        console.log(jsontmp);
                        //新建file对象
                        var msg = {
                            file:scollectiontitle,
                            url:'http://7xnmfe.com1.z0.glb.clouddn.com/'+scollectiontitle
                        };
                        Mysql.project.query('INSERT INTO file SET ?',msg,function(err,result){
                            if(!err){
                                console.log('this is fileresult --------->',result);

                                var update = {
                                    doc:result.insertId
                                };
                                Mysql.project.query('UPDATE scollection SET ? where id="'+scollectionid+'"',update,function(err,re){
                                    if(!err){
                                        console.log('this is projectresult------->',re);

                                        res.json({code:1,text:'打包请求成功！',data:{
                                            downurl:'http://7xnmfe.com1.z0.glb.clouddn.com/'+scollectiontitle,
                                            persistentId:jsontmp.persistentId,
                                            //打包中
                                            type:1
                                        }});
                                    }else{
                                        res.json({code:-1,text:'更新作业file出错'});
                                    }
                                });
                            }else{
                                res.json({code:-1,text:'生成文件对象出错'})
                            }
                        });
                    });
                });
                console.log(JSON.stringify(post_req.headers));
                post_req.on('error',function(e){
                    console.log('problem with request: '+e.message);
                    return res.json({code:-1,text:'problem with request: '+e.message});
                });
                post_req.write(content);
                post_req.end();


            }else{
                res.json({code:-1,text:err});
            }
        });
    }

});

module.exports = router;
