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

router.get('/view/:userId', async function(req, res) {
  try {

    const { sessionVal } = req.common;
    const { sessions } = req.common;
    const userSession = sessions[sessionVal];
    const userId = req.params.userId;
    
    logger.info(`userId xxx: ${userId}`);
    logger.info(`sessionVal xxx: ${sessionVal}`);
    logger.info(`session time: ${userSession.timestamp}`);
    logger.info(`session key: ${userSession.key}`);
    


    // 입력 검증
    if (!userId || userId.trim() === '') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const params = { id: userId, secretkey: my_secret_key };
    const query = mybatisMapper.getStatement('userMapper', 'selectById', params);
    //logger.info(`Executing 22query: ${query}`);
    
    const [rows] = await pool.execute(query, [userId, my_secret_key]);

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