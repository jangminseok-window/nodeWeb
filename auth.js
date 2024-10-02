const express = require('express');
const router = express.Router();
const db = require('./config/mysqlConn.js');

const conn = db.init();

// 로그인
router.post('/login', function(req, res) {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  conn.query(sql, [username, password], function(err, result) {
    if (err) {
      console.log('Query error: ' + err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (result.length > 0) {
      res.status(200).json({ message: 'Login successful', user: result[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// 로그아웃 (세션 기반 인증을 사용한다고 가정)
router.get('/logout', function(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

module.exports = router;