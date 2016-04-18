/**
 * Created by kevin on 15/11/13.
 */
var express = require('express'),
    router = express.Router();

router.get('/',function(){
    console.log('请使用POST logout进行操作');
});

router.post('/', function(req, res) {
    var username = req.session.username;
    req.session.destroy();
    res.json({code:1,msg:'用户'+username+'注销成功！'});
    res.redirect('/login');
});

module.exports = router;