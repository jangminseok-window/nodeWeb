const config = require('config');
const dbConfig = config.get('db');


var mysql = require("mysql2");
var db_info = {
 // host: "localhost",
  host: dbConfig.host,  //"43.201.220.132"
  port:  "3306",
  user:  dbConfig.user ,//"midstar",
  password:  dbConfig.password,//"dlalwjd5",
  database: dbConfig.database,//"midstardb",
};

module.exports = {
  init: function () {
    return mysql.createConnection(db_info);
  },
  connect: function (conn) {
    conn.connect(function (err) {
      if (err) console.error("mysql connection error : " + err);
      else console.log("mysql is connected successfully!");
    });
  },
};