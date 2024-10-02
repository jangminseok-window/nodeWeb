const express = require('express');
const router = express.Router();
const db = require('./config/mysqlConn.js');

const conn = db.init();

// 사용자 등록
router.post('/register', function(req, res) {
  const { username, password, email } = req.body;
  const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
  conn.query(sql, [username, password, email], function(err, result) {
    if (err) {
      console.log('Query error: ' + err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  });
});

// 사용자 정보 조회
router.get('/:userId', function(req, res) {
  const sql = 'SELECT id, username, email FROM users WHERE id = ?';
  conn.query(sql, [req.params.userId], function(err, result) {
    if (err) {
      console.log('Query error: ' + err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

// 사용자 정보 수정
router.put('/:userId', function(req, res) {
  const { email } = req.body;
  const sql = 'UPDATE users SET email = ? WHERE id = ?';
  conn.query(sql, [email, req.params.userId], function(err, result) {
    if (err) {
      console.log('Query error: ' + err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'User updated successfully' });
  });
});

// 사용자 삭제
router.delete('/:userId', function(req, res) {
  const sql = 'DELETE FROM users WHERE id = ?';
  conn.query(sql, [req.params.userId], function(err, result) {
    if (err) {
      console.log('Query error: ' + err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  });
});

module.exports = router;