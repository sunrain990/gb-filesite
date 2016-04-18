/**
 * Created by kevin on 15/12/2.
 */
var express = require('express'),
    qiniu = require('qiniu'),
    config = require('../config'),
    crypto = require('crypto'),
    https = require('https');
var BUCKET = config.Bucket_Name;

qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.SECRET_KEY;

var client = new qiniu.rs.Client();

var putPolicy = new qiniu.rs.PutPolicy(
    BUCKET
);
var uptoken = putPolicy.token();

//增
//qiniu.io.put(uptoken,'suninit','this is the qiniu space init file,readme',null,function(err,ret){
// if(!err){
// console.log(ret.key,ret.hash);
// } else{
// console.log(err);
// }
// });
 //filename0.4540554373525083 FkWuxcH33KVkvuB6vNQz0Oj6m7WK

 //var extra = new qiniu.io.PutExtra();
 //qiniu.io.putFile(uptoken,'oncekey','./logo.png',null,function(err,ret){
 //if(!err){
 //console.log(ret.key,ret.hash);
 //}else{
 //console.log(err);
 //}
 //});

//filename0.993598114233464 FkWuxcH33KVkvuB6vNQz0Oj6m7WK
//oncekey FrcAp37BA9HzZ9VYWIRpThQdQ4Ns

//var client = new qiniu.rs.Client();
//状态
client.stat(BUCKET,'suninit',function(err,ret){
    if(!err){
        console.log(ret);
    }else{
        console.log(err);
    }
});
//
//删除
//client.remove(BUCKET,'scorn1副本.gif',function(err,ret){
//    if(!err){
//        console.log(ret);
//    }else{
//        console.log(err);
//    }
//});
