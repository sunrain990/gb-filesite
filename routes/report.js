var express = require('express');
var Mysql = require('../models/myf');
var router = express.Router();

/* GET home page. */
router.post('/askrank', function(req, res, next) {
      var starttime = req.body.starttime;
      var endtime = req.body.endtime;
      var total = req.body.total;
      if(!total){
        total=30;
      }
      var sql1 = 'SELECT authorid,faqid,count(authorid) cnt FROM post WHERE faqid>0 and time>="'+starttime+'" and time<="'+endtime+'" GROUP BY authorid ORDER BY cnt DESC limit ' +total;
      Mysql.project.query(sql1,function(err,re){
        if(!err){
          res.json({code:1,msg:'列出成功！',data:re});

          //Mysql.project.query(sql1,function(err,rep){
          //  if(!err){
          //    console.log(rep);
          //  }else{
          //    res.json({code:-1,msg:'服务器列表错误！'+err});
          //  }
          //});
        }else{
          res.json({code:-1,msg:'服务器更新错误！'+err});
        }
      });
});

router.post('/askrankk', function(req, res, next) {
  console.log(req.body.starttime);
  var starttime = req.body.starttime;
  var endtime = req.body.endtime;
  var total = req.body.total;
  if(!total){
    total=30;
  }
  var sql = 'SELECT authorid,faqid,count(authorid) cnt FROM post WHERE faqid=0 and time>="'+starttime+'" and time<="'+endtime+'" GROUP BY authorid ORDER BY cnt DESC limit ' +total;
  Mysql.project.query(sql,function(err,re){
    if(!err){
      res.json({code:1,msg:'列出成功！',data:re});
      //Mysql.project.query(sql1,function(err,rep){
      //  if(!err){
      //    console.log(rep);
      //  }else{
      //    res.json({code:-1,msg:'服务器列表错误！'+err});
      //  }
      //});
    }else{
      res.json({code:-1,msg:'服务器更新错误！'+err});
    }
  });
});

router.post('/getpmsg',function(req,res,next){
    var starttime = req.body.starttime;
    var endtime = req.body.endtime;
    var sql = 'select count(1) count from chat_post where type=0 and time>="'+starttime+'" and time<="'+endtime+'"';
    console.log(sql);
    Mysql.project.query(sql,function(err,re){
      if(!err){
        console.log(re);
        res.json({code:1,msg:'列出成功！',count:re[0]});
      }else{
        res.json({code:-1,msg:'列出失败！',data:re});
      }
    });
});

router.post('/getfaqlist',function(req,res,next){
  var id = req.body.id;
  var starttime = req.body.starttime;
  var endtime = req.body.endtime;
  var sql = 'SELECT faqid from post where faqid>0 and time>="'+starttime+'" and time<="'+endtime+'" and authorid='+id;
  console.log(sql);
  Mysql.project.query(sql,function(err,re){
    if(!err){
      console.log(re,'this is re');
      res.json({code:1,msg:'列出成功！',data:re});
    }else{
      res.json({code:-1,msg:'服务器更新错误！'+err});
    }
  });
});

module.exports = router;
