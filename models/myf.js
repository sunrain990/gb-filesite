/**
 * Created by kevin on 15/11/27.
 */
var mysql = require('mysql');
var conn;
function handleError () {
    conn = mysql.createConnection({
        host: 'rdsvy6jrfrbi2a2.mysql.rds.aliyuncs.com',
        user: 'ecp',
        password: 'CqmygDsx2s_MYSQL',
        database: 'project',
        port: 3306
    });

    //conn = mysql.createConnection({
    //    host:'rdsvy6jrfrbi2a2.mysql.rds.aliyuncs.com',
    //    user:'ecp',
    //    password:'CqmygDsx2s_MYSQL',
    //    database:'project',
    //    port:'3306'
    //});

    //连接错误，2秒重试
    conn.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleError , 2000);
        }
    });

    conn.on('error', function (err) {
        console.log('db error', err);
        // 如果是连接断开，自动重新连接
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleError();
        } else {
            throw err;
        }
    });
}
handleError();

var Mysql = {
  project:conn
};
module.exports = Mysql;