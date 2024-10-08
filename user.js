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
  cors,
  getRedisPool
      }  = require('./app-contex');

//각각의 router 정의하고 session 값등 req에 필요한 부분처리
const router = require('express').Router();

const redis = getRedisPool();

router.get('/view', async function(req, res) {
  try {

    const { sessionVal } = req.common;
    
    if (!sessionVal || sessionVal.trim() === '') {
      return res.status(400).json({ error: 'Invalid sessionVal' });
    }

    
    logger.info(`user - view `);
    logger.info(`sessionVal xxx: ${sessionVal}`);
    
    const redis = getRedisPool(); // 이미 생성된 pool
    let sessionData;

    try {

      const exist =  await redis.exists(sessionVal);
      if(exist != 1) {
        return res.status(400).json({ error: 'Invalid sessionVal' });
      }
      const value =  await redis.get(sessionVal);
      logger.info(`redisPool  ${sessionVal}: ${value}`);
      sessionData = JSON.parse(value);
     
    } catch (error) {
      //res.status(500).json('Redis error');
      logger.error(`redis get error!!`);
      throw error; 
      
    }

    const userId = sessionData.userId;
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;