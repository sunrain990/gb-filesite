/**
 * Created by kevin on 15/11/27.
 */
var mysql = require('mysql');
var conn;

var os = require('os');



function handleError () {

    var ipv4;
    for(var i=0;i<os.networkInterfaces().eth1.length;i++){
        if(os.networkInterfaces().eth1[i].family=='IPv4'){
            ipv4=os.networkInterfaces().eth1[i].address;
        }
    }
    var hostname = os.hostname();
    console.log(hostname,ipv4);
    if(ipv4 == '121.41.41.46'){
        conn = mysql.createConnection({
            host: 'rdsf39n5tp6w482946xa.mysql.rds.aliyuncs.com',
            user: 'ecp_test',
            password: 'ecp_test',
            database: 'project',
            port: 3306
        });
        console.log('informal');
    }
    else if(ipv4 == '120.26.245.233'){
        conn = mysql.createConnection({
            host: 'rdsf39n5tp6w482946xa.mysql.rds.aliyuncs.com',
            user: 'ecp_test',
            password: 'ecp_test',
            database: 'project',
            port: 3306
        });
        console.log('test');
    }
    else if(ipv4 == '121.41.123.2'){
        conn = mysql.createConnection({
            host: 'rdsvy6jrfrbi2a2.mysql.rds.aliyuncs.com',
            user: 'ecp',
            password: 'CqmygDsx2s_MYSQL',
            database: 'project',
            port: 3306
        });
        console.log('formal');
    }


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