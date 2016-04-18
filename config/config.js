/**
 * Created by kevin on 15/11/15.
 */
var os = require('os');
module.exports = {
    mysql_dev: {
        host: 'localhost',
        user: 'nodesample',
        password: 'root',
        database: 'root',
        connectionLimit: 10,
        supportBigNumbers: true
    },

};
var ipv4;
for(var i=0;i<os.networkInterfaces().eth1.length;i++){
    if(os.networkInterfaces().eth1[i].family=='IPv4'){
        ipv4=os.networkInterfaces().eth1[i].address;
    }
}
var hostname = os.hostname();
console.log(hostname,ipv4);
if(ipv4 == '121.41.41.46'){

}