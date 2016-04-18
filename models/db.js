/**
 * Created by kevin on 15/11/15.
 */
var mongoose = require('mongoose');
var db  = mongoose.createConnection('mongodb://127.0.0.1:27017/files');
//var moment = require('moment');
var Schema = mongoose.Schema;
//model crud操作
//http://blog.csdn.net/jbboy/article/details/37928739

//链接错误
db.on('error',function(error){
    console.log(error);
});

//LoginSchema
var loginSchema = {
    username:{type:String},
    password:{type:String},
    //,
    dir:{
        //type:Array,default:[]
        type: Array, default: [{name:'（根目录）', children:[]}]
    }
};
var LoginSchema = new Schema(loginSchema);

var LoginModel = db.model('login',LoginSchema);

var Model = {
    LoginModel:LoginModel
}

module.exports = Model;