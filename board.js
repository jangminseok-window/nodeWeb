const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require("body-parser");
const db = require("./config/mysqlConn.js");
const app = express();
const conn = db.init();
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      console.log(file),
        fs.existsSync("./uploads/") ||
          fs.mkdirSync("./uploads/", { recursive: !0 }),
        callback(null, "./uploads/");
    },
    filename: function (req, file, callback) {
      callback(null, file.originalname);
    },
  }),
});

app.set("port", process.env.PORT || 3000);
app.set("host", process.env.HOST || "0.0.0.0");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 게시글 목록 보기
app.get("/view", function (req, res) {
  var sql = "select * from board";
  conn.query(sql, function (err, result) {
    if (err) console.log("query is not excuted: " + err);
    else res.send(result);
  });
});

// 게시글 쓰기
app.post("/insert", upload.single("img"), function (req, res) {
  var body = req.body;
  var sql = "SELECT count(*)+1 as bnum FROM board ";
  conn.query(sql, function (err, result) {
    if (err) console.log("query is not excuted: " + err);
    else {
      var sql =
        "insert into board (bnum,id,title,content,writedate) values(?,?,?,?,NOW())";
      var params = [result[0].bnum, body.id, body.title, body.content];
      conn.query(sql, params, function (err) {
        if (err) console.log("query is not excuted: " + err);
        else if (req.file != null) {
          // 만약 업로드 된 파일이 있다면
          var sql =
            "insert into file (bnum,savefile,filetype,writedate) values (?,?,?,now())";
          var params = [body.bnum, req.file.originalname, req.file.mimetype];
          conn.query(sql, params, function (err) {
            if (err) console.log("query is not excuted: " + err);
            else res.sendStatus(200);
          });
        } else res.sendStatus(200);
      });
    }
  });
});

// 게시글 보기
app.get("/read/:bnum", function (req, res) {
  var sql = "select * from board where bnum=" + req.params.bnum;
  conn.query(sql, function (err, result) {
    if (err) console.log("query is not excuted: " + err);
    else res.send(result);
  });
});

// 게시글 수정
app.post("/update/:bnum", function (req, res) {
  var body = req.body;
  var sql =
    "update board set id=?, title=?, content=? where bnum=" + req.params.bnum;
  var params = [body.id, body.title, body.content];
  conn.query(sql, params, function (err) {
    if (err) console.log("query is not excuted: " + err);
    else res.sendStatus(200);
  });
});

// 게시글 삭제
app.get("/delete/:bnum", function (req, res) {
  var sql = "delete from board where bnum=" + req.params.bnum;
  conn.query(sql, function (err) {
    if (err) console.log("query is not excuted: " + err);
    else res.sendStatus(200);
  });
});

// 이미지 파일 불러오기
app.get("/img/:bnum", function (req, res) {
  var sql = "select * from file where bnum=" + req.params.bnum;
  conn.query(sql, function (err, result) {
    if (err) console.log("query is not excuted: " + err);
    else if (result.length != 0) {
      fs.readFile("uploads/" + result[0].savefile, function (err, data) {
        res.writeHead(200, { "Context-Type": "text/html" });
        res.end(data);
      });
    } else res.sendStatus(200);
  });
});

// 서버 동작중인 표시
app.listen(app.get("port"), app.get("host"), () =>
  console.log(
    "Server is running on : " + app.get("host") + ":" + app.get("port")
  )
);