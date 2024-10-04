const config = require('config');
const dbConfig = config.get('db');

const logger = require('./log');
const express = require('express');
const router = express.Router();
const db = require('./config/mysqlConn');
const cryptoUtil = require('./crypto/cryptoutil');

const my_secret_key =  dbConfig.secretkey;

const conn = db.init();

// 사용자 등록
router.post('/register', async function(req, res) {
  try {
    const { id, pwd, name, email ,birthday} = req.body;

    // 입력 값 검증
    if (!id || !pwd || !name || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 비밀번호 해시화
    const hashedPwd = await cryptoUtil.hashPassword(pwd);

    logger.info(`Hashed password for user ${id}`);
    
    const sql = `INSERT INTO users (id, pwd, name, email, birthday) VALUES (?, ?, ?, ?, AES_ENCRYPT(?, ?))`;
    conn.query(sql, [id, hashedPwd, name, email,birthday,my_secret_key], function(err, result) {
      if (err) {
        logger.error('Query error: ' + err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.status(201).json({ message: 'User registered successfully', id: result.insertId });
    });
  } catch (error) {
    logger.error('Error in user registration: ' + error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// 사용자 정보 조회
router.get('/view/:userId', function(req, res) {
  const userId = req.params.userId; // 'userId'로 변경

  // SQL 인젝션 방지를 위해 pwd 필드 제외
  const sql = `SELECT id, name, email , CAST(AES_DECRYPT(birthday, ?) AS CHAR) AS birthday FROM users WHERE id = ?`;

  conn.query(sql, [my_secret_key,userId], function(err, result) {
    logger.info('Query ID: ' + userId);

    if (err) {
      logger.error('Query error: ' + err); // 'error'로 변경
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length > 0) {
      const user = result[0];
      // 민감한 정보 제거
      delete user.pwd;
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});

// 사용자 정보 수정
router.get('/update/:userId', function(req, res) {
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
router.get('/delete/:userId', function(req, res) {
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