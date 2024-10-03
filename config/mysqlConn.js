var mysql = require("mysql2");
var db_info = {
 // host: "localhost",
  host: "43.201.220.132",
  port: "3306",
  user: "midstar",
  password: "dlalwjd5",
  database: "midstardb",
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