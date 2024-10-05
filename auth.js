// router 는 제외하고 정의
const {  
  config,
  dbConfig,
  logger,
  express,
  db,
  cryptoUtil,
  mybatisMapper,
  my_secret_key,
  pool,
  serverConfig,
  bodyParser,
  cors
      }  = require('./app-contex');


//각각의 router 정의하고 session 값등 req에 필요한 부분처리
const router = require('express').Router();

// 로그인
router.post('/login', async function(req, res) {
  try {
    const { username, password } = req.body;

    // 입력 검증
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // 사용자 조회
    const sql = 'SELECT * FROM users WHERE id = ?';
    conn.query(sql, [username], async function(err, results) {
      if (err) {
        logger.error('Query error: ' + err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = results[0];

      // 비밀번호 검증
      const isMatch = await cryptoUtil.comparePassword(password, user.pwd);

      if (isMatch) {
        // 비밀번호 일치
       // const { pwd, ...userWithoutPassword } = user;
        // 세션에 사용자 정보 저장 (세션 미들웨어가 설정되어 있다고 가정)
       // req.session.user = userWithoutPassword;
       // res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
       res.status(200).json({ message: 'Login successful'});
      } else {
        // 비밀번호 불일치
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
  } catch (error) {
    logger.error('Login error: ' + error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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