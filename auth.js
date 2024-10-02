const express = require('express');
const router = express.Router();
const db = require('./config/mysqlConn');

// 인증 관련 라우트
router.post('/login', (req, res) => {
  // 로그인 로직
});

router.post('/register', (req, res) => {
  // 회원가입 로직
});

// 기타 인증 관련 라우트...

module.exports = router;