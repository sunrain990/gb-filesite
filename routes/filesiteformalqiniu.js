/**
 * Created by kevin on 15/11/13.
 */
var express = require('express'),
    qiniu = require('qiniu'),
    //config = require('../config'),
    Model = require('../models/db'),
    crypto = require('crypto'),
    https = require('https'),
    Mysql = require('../models/my'),
    router = express.Router();
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

//var userName = 'zm';

router.post('/getlist',function(req,res,next){
    var userName;
    if(req.body.username){
        userName = req.body.username;
    }else{
        userName = req.session.username;
    }
    Model.LoginModel.find({username:userName},function(err,model){
       if(err){
           console.log(err);
           return;
       }else{
           if(model[0].length == 0){
               return res.redirect(302,'/login.html');
               return res.json({code:-1,msg:'未登录！'});
           }
           console.log(model,'this is model');
           if(model[0].dir){
               return res.json(
                   {
                       code:1,
                       msg:'获取目录成功！',
                       data:{
                           dir: model[0].dir
                       }
                   });
           }
       }
    });
});

router.post('/mkdirp',function(req,res,next){
    var userName = req.session.username;
    //var currentDir = req.body.currentDir;
    var dirStr = req.body.dirStr;
    var dirStrArr = dirStr.split('/');
    dirStrArr.shift();
    var query = {username:userName};

    Model.LoginModel.findOne(query,function(err,doc){
        var rootDir = doc.dir.slice();
        console.log(rootDir);

        if(dirStrArr.length == 0){
            //dirStrArr = "" []
            console.log('length0');
        }else if(dirStrArr[0] == ""){
            //dirStrArr = '/'
            console.log('length空');
        }else {
            //dirStrArr = '/a/b/c'

            var selfish;
            var str = 'selfish=rootDir[0]["children"]';
            for(var i=0;i<dirStrArr.length;i++){
                eval(str);
                var tmp = selfish.filter(function(item,j,arr){
                    if(arr[j]['name'] == dirStrArr[i]){
                        str += '['+j+']'+'["children"]';
                    }
                    return item['name'] == dirStrArr[i];
                });
                if(tmp.length == 0){
                    selfish.push(
                        {
                            name:dirStrArr[i],
                            children:[],
                            depth:i+1
                        }
                    );
                    str += '['+(selfish.length-1)+']'+'["children"]';
                }
            }
        }
        console.log(rootDir);
        doc.dir = rootDir;
        doc.markModified('dir');
        doc.save(function(err,doc){
            if(err){
                res.json(200,{code:1,msg:'err'});
            }else if(doc){
                res.json({data:1,msg:'批量创建目录成功！'});
            }
        });
    });
});

router.post('/touchonce',function(req,res,next){
    var userName;
    if(req.body.username){
        userName = req.body.username;
    }else{
        userName = req.session.username;
    }
    //userzm_blockid1M_Maa.zip
    //var touchstr = 'zm_blockid1M_M/a/a.zip';
    var touchstr = req.body.key;
    //download路径
    var url = req.body.url;
    var up = req.body.up;

    var touchstrArr = touchstr.split('M_M');
    var prefix= touchstrArr[0];
    var prefixArr = prefix.split('_');
    console.log(prefixArr);
    var userName = prefixArr[0];

    var query = {username:userName};
    console.log(query,'this is query!!!');
    Model.LoginModel.findOne(query,function(err,doc){
        if(err){
            console.log(err);
        }else{
            //如果不存在用户，自动注册用户，密码为一样的
            if(!doc){
                console.log('no query!');
                var md5 = crypto.createHash('md5');
                var userPwd = md5.update(userName).digest('hex');

                var userinfo = {
                    username: userName,
                    password: userPwd,
                    dir:[{name:'（根目录）', children:[]}]
                };
                console.log(userinfo,'this is doc!!');
                new Model.LoginModel(userinfo).save(function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log('用户注册OK!');
                    }
                });
            }

            //肯定有用户了
            Model.LoginModel.findOne(query,function(err,doc){
                if(err){
                    return res.json({data:-1,msg:'用户信息处理失败！'});
                }
                var fileStr = '/（杰米诺）'+'/'+prefix+touchstrArr[1];
                console.log(fileStr,'this is fileStr');
                var fileStrArr = fileStr.split('/');
                fileStrArr.shift();
                var query = {username:userName};
                var rootDir = doc.dir.slice();
                console.log(rootDir);
                var nuoindex;

                if(fileStrArr.length == 0){
                    //dirStrArr = "" []
                    console.log('length0');
                }else if(fileStrArr[0] == ""){
                    //dirStrArr = '/'
                    console.log(fileStrArr);
                    console.log('length空');
                }else {
                    //dirStrArr = '/a/b/c'
                    var selfish;
                    var str = 'selfish=rootDir[0]["children"]';
                    for(var i=0;i<fileStrArr.length;i++){
                        eval(str);
                        var tmp = selfish.filter(function(item,j,arr){
                            if(arr[j]['name'] == fileStrArr[i]){
                                str += '['+j+']'+'["children"]';
                                console.log(arr[j]['name'],'this is 杰米诺name！');
                                if(arr[j]['name'] == '（杰米诺）'&& i==0){
                                    nuoindex = j;
                                }
                            }
                            return item['name'] == fileStrArr[i];
                        });
                        if(tmp.length == 0){
                            if(fileStrArr[i] == '（杰米诺）'&&i ==0){
                                nuoindex = 0;
                            }
                            if(i == fileStrArr.length-1){
                                //selfish.push(
                                //    {
                                //        name:fileStrArr[i],
                                //        children:[],
                                //        depth:i+1,
                                //        url:url,
                                //        up:up
                                //    }
                                //);
                                console.log(selfish,'this is the last selfish');
                                selfish[0]={
                                    name:fileStrArr[i],
                                    children:[],
                                    depth:i+1,
                                    url:url,
                                    up:up,
                                    key:touchstr
                                };
                                console.log(selfish,'this is the last selfish');
                                continue;
                            }
                            selfish.push(
                                {
                                    name:fileStrArr[i],
                                    children:[],
                                    depth:i+1
                                }
                            );
                            str += '['+(selfish.length-1)+']'+'["children"]';
                        }
                    }
                }
                doc.dir = rootDir;
                console.dir(rootDir[0],'this is rootDIrlllllllllllllll');

                doc.markModified('username');
                doc.markModified('password');
                doc.markModified('dir');
                doc.save();

                //rootDir[0]['children'][nuoindex][]
                console.log(nuoindex,'this is nuoindex');

                var uponce;
                rootDir[0]['children'][nuoindex]['children'].forEach(function(i){
                    console.log(i,'this is iiiiii');
                    if(i['name'] == prefix){
                        console.log(uponce,'this is uponce!');
                        return uponce = i;
                    }
                });

                if(uponce){
                    return res.json({code:1,msg:'批量创建目录成功！',data:{children:uponce['children']}});
                }else{
                    return res.json({code:-1,msg:'批量创建目录失败！',data:{children:[]}});
                }
            });

        }
    });
});

router.post('/touchp',function(req,res,next){
    var userName;
    if(req.body.username){
        userName = req.body.username;
    }else{
        userName = req.session.username;
    }
    //userzm_blockid1M_Maa.zip
    //var touchstr = 'zm_blockid1M_M/a/a.zip';
    var touchstr = req.body.key;
    //download路径
    var url = req.body.url;
    var up = req.body.up;

    var touchstrArr = touchstr.split('M_M');
    //zm_blockid1
    var prefix= touchstrArr[0];

    var prefixArr = prefix.split('_');
    console.log(prefixArr);
    var userName = prefixArr[0];

    var nuoindex;

    var query = {username:userName};
    console.log(query,'this is query!!!');
    Model.LoginModel.findOne(query,function(err,doc){
        if(err){
            console.log(err);
        }else{
            //如果不存在用户，自动注册用户，密码为一样的
            if(!doc){
                console.log('no query!');
                var md5 = crypto.createHash('md5');
                var userPwd = md5.update(userName).digest('hex');

                var userinfo = {
                    username: userName,
                    password: userPwd,
                    dir:[{name:'（根目录）', children:[]}]
                };
                console.log(userinfo,'this is doc!!');
                new Model.LoginModel(userinfo).save(function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log('用户注册OK!');
                    }
                });
            }

            //肯定有用户了
            Model.LoginModel.findOne(query,function(err,doc){
                if(err){
                    return res.json({data:-1,msg:'用户信息处理失败！'});
                }
                var fileStr = '/（杰米诺）'+touchstrArr[1];
                console.log('fileStrjieminuo',fileStr);
                var fileStrArr = fileStr.split('/');
                fileStrArr.shift();
                var query = {username:userName};
                var rootDir = doc.dir.slice();
                console.log(rootDir);

                if(fileStrArr.length == 0){
                    //dirStrArr = "" []
                    console.log('length0');
                }else if(fileStrArr[0] == ""){
                    //dirStrArr = '/'
                    console.log(fileStrArr);
                    console.log('length空');
                }else {
                    //dirStrArr = '/a/b/c'
                    console.log('selfish!!!');
                    var selfish;
                    var str = 'selfish=rootDir[0]["children"]';
                    for(var i=0;i<fileStrArr.length;i++){
                        eval(str);
                        var tmp = selfish.filter(function(item,j,arr){
                            if(arr[j]['name'] == fileStrArr[i]){
                                str += '['+j+']'+'["children"]';
                                console.log(arr[j]['name']);
                                if(arr[j]['name'] == '（杰米诺）'&& i==0){
                                    console.log(j,'thisis childrenj');
                                    nuoindex = j;
                                }
                            }
                            return item['name'] == fileStrArr[i];
                        });
                        if(tmp.length == 0){
                            if(i == fileStrArr.length-1){
                                selfish.push(
                                    {
                                        name:fileStrArr[i],
                                        children:[],
                                        depth:i+1,
                                        url:url,
                                        up:up
                                    }
                                );
                                continue;
                            }
                            selfish.push(
                                {
                                    name:fileStrArr[i],
                                    children:[],
                                    depth:i+1
                                }
                            );
                            str += '['+(selfish.length-1)+']'+'["children"]';
                        }
                    }
                }
                console.log(rootDir);
                doc.dir = rootDir;

                doc.markModified('username');
                doc.markModified('password');
                doc.markModified('dir');
                doc.save();

                for(var i=0;i<rootDir[0]['children'].length;i++){
                    if(rootDir[0]['children'][i]['name'] == '（杰米诺）'){
                        var filtered = doc.dir[0]['children'][i]['children'].filter(function(child){
                            console.log(child,'this is child!!!');
                            return child['url'].indexOf('http://7xnmfe.com1.z0.glb.clouddn.com/'+prefix) == 0;
                        });
                        var jieminuo =doc.dir[0]['children'][i]['children'] = filtered;
                        return res.json({code:1,msg:'批量创建目录成功！',data:{children:jieminuo}});
                    }
                }
            });

        }
    });
});


router.post('/touch',function(req,res,next){
    var userName = req.session.username;
    var currentDir = req.body.currentDir;
    var query={username:userName};
    console.log(currentDir);
    Model.LoginModel.findOne(query,function(err,doc){
        doc.dir = currentDir[0];
        console.log(doc.dir);
        doc.save();
    });
    return res.json({data:1,msg:'上传成功！'});
});

router.post('/mytouch',function(req,res,next){
    //var selectSQL = 'select * from file limit 10';
    //Mysql.project.query(selectSQL,function(err,rows){
    //    if (err) console.log(err);
    //    console.log("SELECT ==> ");
    //    for (var i in rows) {
    //        console.log(rows[i]);
    //    }
    //});
    var file = req.body.key;
    var uploader = req.body.uploader;
    var url = req.body.url;
    var addtime = req.body.addtime;
    var scheduleid = req.body.scheduleid;
    console.log(file,uploader,url);
    var post = {
        file:file,
        uploader:uploader,
        url:url,
        addtime:addtime
    };
    Mysql.project.query('SELECT authorid from schedule where id='+scheduleid,function(err,result){
        if(result[0].authorid==uploader){
            Mysql.project.query('INSERT INTO file SET ?',post,function(err,result){
                if(!err){
                    console.log(result.insertId,'this is result');

                    var update = {
                        file:result.insertId
                    };
                    Mysql.project.query('UPDATE schedule SET ? where id="'+scheduleid+'"',update,function(err,re){
                        if(!err){
                            console.log(re,'this is re');
                            res.json({code:1,msg:'上传成功！',data:{children:[post]}});
                        }else{
                            res.json({code:-1,msg:'服务器更新错误！'});
                        }
                    });
                }else{
                    res.json({code:-1,msg:'服务器插入错误！'});
                }
            });
        }else{
            console.log('非本人上传！')
            res.json({code:-1,msg:'非本人上传！'});
        }
    });


});

router.post('/mkdir',function(req,res,next){
    var userName = req.session.username;
    var currentDir = req.body.currentDir;
    //TODO 把children从数组后面添加到前面去
    //console.log(currentDir,'currentDir');
    //currentDir.shift();
    //console.log(currentDir,'currentDir1');
    var query={username:userName};
    console.log(currentDir);
    Model.LoginModel.findOne(query,function(err,doc){
        doc.dir = currentDir[0];
        console.log(doc.dir);
        doc.save();
    });

    //Model.LoginModel.find({username:userName},function(err,model){
    //    if(err){
    //        console.log(err,model);
    //        return;
    //    }
    //    if(model[0].dir){
    //        var rootDir = model[0].dir;
    //        console.log(model[0].dir,'thisi s dir');
    //        console.log(currentDir,'thisi s currentdir');
    //        var selfish = rootDir;
    //        var tmp = [];
    //        var _selfish;
    //        var str = 'selfish=rootDir';
    //        for(var i=0;i<currentDir.length;i++) {
    //            //_selfish = selfish;
    //            console.log(str,'SSSSSSSSSSTR');
    //            eval(str);
    //            var _str = str;
    //            var tmp = rootDir.filter(function (item, j,arr) {
    //                if(arr[j]['name'] == currentDir[i]['name']){
    //                    str += '[' + j + ']' + '["children"]';
    //                }
    //                return item['name'] == currentDir[i]['name'];
    //            });
    //            if (tmp.length == 0) {
    //                selfish.push(currentDir[i]);
    //            }
    //        }
    //        var query={username:userName};
    //        //Model.LoginModel.update(query,{$set:{dir:rootDir}});
    //        Model.LoginModel.findOne(query,function(err,doc){
    //            doc.dir = rootDir;
    //            doc.save();
    //        });
    //    }
    //    return res.json({code:1,msg:'创建成功！',data:{dir:rootDir}});
    //});

    return res.json({code:1,msg:'创建成功！',data:{dir:currentDir}});
});

router.post('/getonefilelist',function(req,res,next){
    var userName;
    if(req.body.username){
        userName = req.body.username;
    }else{
        userName = req.session.username;
    }
    var scheduleid = req.body.scheduleid;
    var prefix = userName + '_'+ scheduleid;
    console.log(userName,scheduleid);
    var query={username:userName};

    Model.LoginModel.findOne(query,function(err,doc){
        if(err){
            return res.json({code:-1,msg:'后台错误！'});
        }else if(!doc){
            return res.json({code:-1,msg:'返回列表失败！',data:{children:[]}});
        }else{
            var jieminuo;
            var jp={
                children:[]
            };
            if(doc.dir[0]['children'].length>0){
                for(var i=0;i<doc.dir[0]['children'].length;i++){
                    if(doc.dir[0]['children'][i]['name'] == '（杰米诺）'){
                        jieminuo = doc.dir[0]['children'][i];
                    }
                }
                //if(scheduleid&&jieminuo['children'].length>0){
                //    for(var i=0;i<jieminuo['children'].length;i++){
                //        jieminuo['children'][i]['name']
                //    }
                //}

                console.log(jieminuo['children'][0]['children']);
                if(jieminuo['children'].length == 0){
                    return res.json({code:-1,msg:'返回列表成功！',data:{children:[]}});
                }
                for(var j=0;j<jieminuo['children'].length;j++){
                    if(jieminuo['children'][j]['name'] == prefix){
                        jp = jieminuo['children'][j];
                    }
                }

                //var filtered = jieminuo['children'].filter(function(child){
                //    console.log(child,'this is child',child['url'].indexOf('http://7xnmfe.com1.z0.glb.clouddn.com/'+userName+'_'+scheduleid),'http://7xnmfe.com1.z0.glb.clouddn.com/'+userName+'_'+scheduleid);
                //
                //    return child['url'].indexOf('http://7xnmfe.com1.z0.glb.clouddn.com/'+userName+'_'+scheduleid) != -1;
                //});

                //jieminuo['children'] = filtered;
                return res.json({code:1,msg:'返回列表成功！',data:{children:jp['children']}});
            }else{
                return res.json({code:-1,msg:'返回列表失败！',data:{children:[]}});
            }
        }
    });
});

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

router.post('/getallfilelist',function(req,res,next){
    var schedules = req.body.schedules;
    //console.log(schedules);
    var childrens = [];

    var downchild = function(query,prefix){
        var jjj;
        Model.LoginModel.findOne(query,function(err,doc){
            //console.log(query,prefix);
            if(err){
                return res.json({code:-1,msg:'后台错误！'});
            }else if(!doc){
                return res.json({code:-1,msg:'返回列表失败！',data:{children:[]}});
            }else{
                var jieminuo;
                var jp={
                    children:[]
                };
                if(doc.dir[0]['children'].length>0){
                    for(var i=0;i<doc.dir[0]['children'].length;i++){
                        if(doc.dir[0]['children'][i]['name'] == '（杰米诺）'){
                            jieminuo = doc.dir[0]['children'][i];
                        }
                    }
                    var filtered = jieminuo['children'].filter(function(i,m,n){
                        return i['name'] == prefix;
                    });
                    if(filtered.length == 0){
                        console.log(jp,'0');
                        //childrens.push(jp);
                        return jjj = jp;
                    }else{
                        console.log(filtered,'1');
                        //childrens.push(filtered);
                        return jjj = filtered;

                    }
                }else{
                }
            }
        });
    };

    for(var i=0;i<schedules.length;i++){
        var userName = schedules[i].username;
        var scheduleid = schedules[i].scheduleid;
        var prefix = userName + '_'+ scheduleid;
        var query = {username:userName};
        if(i==schedules.length-1){
            console.log(childrens);
            return res.json({gg:'bb'});
        }
        downchild(query,prefix);
        console.log(childrens,'this is children',i);
    }
    //schedules.forEach(function(schedule,i){
    //    var userName = schedule.username;
    //    var scheduleid = schedule.scheduleid;
    //    var prefix = userName + '_'+ scheduleid;
    //    var query = {username:userName};
    //
    //    var abc = downchild(query,prefix,childrens);
    //    if(i==schedules.length-1){
    //        console.log(abc,childrens);
    //        return res.json({gg:'bb'});
    //    }
    //});

    //for(var i=0;i<schedules.length;i++){
    //    var userName = schedules[i].username;
    //    var scheduleid = schedules[i].scheduleid;
    //    var prefix = userName + '_'+ scheduleid;
    //    var query = {username:userName};
    //
    //    console.log(query,prefix);
    //    Model.LoginModel.findOne(query,function(err,doc){
    //        console.log(query,prefix);
    //        if(err){
    //            return res.json({code:-1,msg:'后台错误！'});
    //        }else if(!doc){
    //            return res.json({code:-1,msg:'返回列表失败！',data:{children:[]}});
    //        }else{
    //            var jieminuo;
    //            var jp={
    //                children:[]
    //            };
    //            if(doc.dir[0]['children'].length>0){
    //                for(var i=0;i<doc.dir[0]['children'].length;i++){
    //                    if(doc.dir[0]['children'][i]['name'] == '（杰米诺）'){
    //                        jieminuo = doc.dir[0]['children'][i];
    //                    }
    //                }
    //
    //                //console.log(jieminuo['children'][0]['children']);
    //                if(jieminuo['children'].length == 0){
    //                    return res.json({code:-1,msg:'返回列表成功！',data:{children:[]}});
    //                }
    //                for(var j=0;j<jieminuo['children'].length;j++){
    //                    if(jieminuo['children'][j]['name'] == prefix){
    //                        console.log(jieminuo['children'][j]['name'],'|||||||||||||||||||||',prefix,'---------------------');
    //                        jp = jieminuo['children'][j];
    //                        childrens.children.push(jp);
    //                    }
    //                }
    //
    //                //return res.json({code:1,msg:'返回列表成功！',data:{children:jp['children']}});
    //            }else{
    //                //return res.json({code:-1,msg:'返回列表失败！',data:{children:[]}});
    //            }
    //        }
    //    });
    //}
    //console.log(childrens);

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


    //Model.LoginModel.findOne(query,function(err,doc){
    //    if(err){
    //        console.log(err);
    //    }else {
    //        //如果不存在用户，自动注册用户，密码为一样的
    //        if (!doc) {
    //            console.log('no query!');
    //            var md5 = crypto.createHash('md5');
    //            var userPwd = md5.update(userName).digest('hex');
    //
    //            var userinfo = {
    //                username: userName,
    //                password: userPwd,
    //                dir: [{name: '（根目录）', children: []}]
    //            };
    //            console.log(userinfo, 'this is doc!!');
    //            new Model.LoginModel(userinfo).save(function (err) {
    //                if (err) {
    //                    console.log(err);
    //                } else {
    //                    console.log('用户注册OK!');
    //                }
    //            });
    //        }
    //    }});
});

router.post('/rmfile',function(req,res,next){
    var userName;
    var filename = req.body.filename;
    var scheduleid = req.body.scheduleid;
    var filekey = req.body.filekey;
    if(req.body.username){
        userName = req.body.username;
    }else{
        userName = req.session.username;
    }
    var prefix = userName + '_' + scheduleid;
    var query = {
        username:userName
    };
    if(userName == undefined){
        return res.json({code:-1,msg:'用户名出错！'});
    }
    console.log(userName);


    client.remove(BUCKET,filekey,function(err,ret){
       if(!err){
           Model.LoginModel.findOne(query,function(err,doc){
               var jieminuo;
               var tempi;
               var tempdoc;
               var tempj;
               for(var i=0;i<doc.dir[0]['children'].length;i++){
                   if(doc.dir[0]['children'][i]['name'] == '（杰米诺）'){
                       jieminuo = doc.dir[0]['children'][i];
                       tempi = i;
                   }
               }
               console.log(tempi,filename,'this is tempi!');

               for(var j=0;j<jieminuo['children'].length;j++){
                   if(doc.dir[0]['children'][tempi]['children'][j]['name'] == prefix){
                       tempj = j;
                   }
               }

               var tempdoc = doc.dir[0]['children'][tempi]['children'][tempj]['children'].pop();

               doc.markModified('dir');
               doc.save();
               return res.json({code:1,msg:'返回列表成功！',data:{children:tempdoc['children']}});
               //ok
               console.log('rm oK!',filekey);
           });
       } else{
           console.log(err,'删除失败！');
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

router.post('/upload',function(req,res,next){
    var userName = req.session.username;
    var currentDir = req.body.currentDir;
    var currentDirS = req.body.currentDirS;
    var filename = req.body.filename;
    var filetype = req.body.filetype;
    var emsg = req.body.emsg;
    currentDir.shift();

    Model.LoginModel.find({username:userName},function(err,model){
        if(err){
            console.log(err,model);
            return;
        }
        if(model[0].dir){
            var rootDir = model[0].dir;
            var str = 'self=rootDir';
            var tmp=[];
            for(var i= 0;i<currentDir.length;i++){
                str +='[0]["children"]';
                eval(str);

                tmp = self.filter(function(item){return item['name'] == currentDir[i]['name']});
                if(tmp.length == 0){
                    self.push(currentDir[i]);
                }
            }
            var query={username:userName};
            //Model.LoginModel.update(query,{$set:{dir:rootDir}});
            Model.LoginModel.findOne(query,function(err,doc){
                doc.dir = rootDir;
                doc.save();
                //return res.json({data:1,msg:'设置目录成功！'});
            });
            //new Model.LoginModel({dir:rootDir}).save(function(err){
            //    if(err){
            //        console.log(err);
            //    }else{
            //        console.log('目录建立成功!');
            //    }
            //});
            console.log('这里先');
            //return res.json({data:1,msg:'查询用户目录成功！'});
        }
    });

    return res.json({data:1,msg:'查询成功！'});
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
            if(rere.length!=0){

                Mysql.project.query('select file,title from scollection where id='+scollectionid,function(err,result){
                    console.log(result,'this is result');
                    if(result.length != 0){
                        var result0 = result[0];
                        scollectiontitle = result0.title;
                        if(result0.file == 0){
                            //return res.json({code:1,data:'有新的上传文件，需要重新打包！'});
                            package();
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





    function package(){
//select url from file where id in (select file from schedule where id in (select scheduleid from scollection_schedule where scollectionid=7))
        var querydownnames = 'select url from file where id in (select file from schedule where id in (select scheduleid from scollection_schedule where scollectionid='+scollectionid+'))';
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
                    notifyURL:'http://121.41.41.46:8000/filesite/filespacked'
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
                            package();
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





    function package(){
//select url from file where id in (select file from schedule where id in (select scheduleid from scollection_schedule where scollectionid=7))
        var querydownnames = 'select url from file where id in (select doc from schedule where id in (select scheduleid from scollection_schedule where scollectionid='+scollectionid+'))';
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
                    notifyURL:'http://121.41.41.46:8000/filesite/docspacked'
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
