const config = require('config');
const dbConfig = config.get('db');
const logger = require('./log');
const express = require('express');
const router = express.Router();
const db = require('./config/mysqlConn');
const cryptoUtil = require('./crypto/cryptoutil');
const mybatisMapper = require('mybatis-mapper');

const my_secret_key = dbConfig.secretkey;
const pool = db.init(); // 연결 풀 사용

mybatisMapper.createMapper(['./sql/user.xml']);

// 사용자 정보 조회
router.get('/view/:userId', async function(req, res) {
  try {
    const userId = req.params.userId;

    logger.info(`userId xxx: ${userId}`);

    // 입력 검증
    if (!userId || userId.trim() === '') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const params = { id: userId ,secretkey:my_secret_key};
    const query = mybatisMapper.getStatement('userMapper', 'selectById', params);
    
    logger.info('Executing query:', query);

    // 여기를 수정합니다
    const [rows] = await pool.execute(query, [userId,my_secret_key]);  // 파라미터를 배열로 전달
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('Query results:', rows);
    res.json(rows[0]);
  } catch (error) {
    logger.error('Error executing query:', error);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;