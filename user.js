
const utils = require('./common/utils');
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
  getRedisPool,
  app,
  axios,
  apiConfig
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

    logger.info(`user display - view `);
    logger.info(`display sessionVal xxx: ${sessionVal}`);

    const method = 'get';
    const url = `http://${apiConfig.host}:${apiConfig.port}/user/view`;
    const headers = {'x-session-id': sessionVal, 'Content-Type': 'application/json'};
    const params = { userId: sessionVal }; // sessionVal을 쿼리 파라미터로 전달

    const result = await utils.axiosCall(method, url, null, headers, params);

    logger.info('API Response:', result); // 로그 추가

    // result가 객체인 경우 배열로 변환
    const items = Array.isArray(result) ? result : [result];

    res.render('userView', {
      title: 'User View',
      heading: 'Welcome to User View',
      items: items
    });
  } catch (error) {
    logger.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

// 사용자 등록
router.post('/register', async function(req, res) {
  try {
    const { id, pwd, name, email, birthday } = req.body;

    // 입력 값 검증
    if (!id || !pwd || !name || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // 비밀번호 해시화
    const hashedPwd = await cryptoUtil.hashPassword(pwd);

    logger.info(`Hashed password for user ${id}`);

    const params = {
      id,
      pwd: hashedPwd, // 해시화된 비밀번호 사용
      name,
      email,
      birthday,
      secretkey: my_secret_key// 환경 변수에서 비밀 키 가져오기
    };
    
    try {
        const query = mybatisMapper.getStatement('userMapper', 'insertUser', params);
        
        const [result] = await pool.execute(query);
    } catch (error) {
      logger.error('Error executing query:', error);
      throw error; 
    }


    
    logger.info(`User ${id} registered successfully`);
    res.status(201).json({ message: 'User registered successfully' });
    
  } catch (error) {
    logger.error('Error in user registration: ' + error);
    res.status(500).json({ error  });
  }
});



// 사용자 정보 수정
router.post('/update', async function(req, res) {
  try {

    const { sessionVal } = req.common;
    
    if (!sessionVal || sessionVal.trim() === '') {
      return res.status(400).json({ error: 'Invalid sessionVal' });
    }

    
    logger.info(`user - update `);
    logger.info(`sessionVal xxx: ${sessionVal}`);

    const { pwd, name, email, birthday } = req.body;

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
    
    
    // 비밀번호 해시화
    const hashedPwd = await cryptoUtil.hashPassword(pwd);

    logger.info(`Hashed password for user ${userId}`);

    const params = {
      id: userId,
      pwd: hashedPwd, // 해시화된 비밀번호 사용
      name,
      email,
      birthday,
      secretkey: my_secret_key// 환경 변수에서 비밀 키 가져오기
    };

    try {
      const query = mybatisMapper.getStatement('userMapper', 'updateUser', params);
      const [result] = await pool.execute(query);
      logger.info(`User info updated. Affected rows: ${result.affectedRows}`);

      const selectparams = { id: userId, secretkey: my_secret_key };
      const selectQuery = mybatisMapper.getStatement('userMapper', 'selectById', selectparams);
      const [rows] = await pool.execute(selectQuery);
     
      const newSessionData = JSON.stringify({
        userId: rows[0].id,
        name: rows[0].name,
        email:rows[0].email,
        birthday: rows[0].birthday,
      });
    
      await redis.set(sessionVal, newSessionData);
      await redis.expire(sessionVal, serverConfig.sessionTimeout); 

     


    } catch (error) {
      logger.error('Error executing query:', error);
      throw error; 
    }
    
    logger.info(`User ${userId} update successfully`);
    
   

    res.status(201).json({ message: 'User update successfully' });
    
  } catch (error) {
    logger.error('Error in user update: ' + error);
    res.status(500).json({ error  });
  }     
});

// 사용자 삭제
router.post('/delete', async function(req, res) {
  
  try {

    const { sessionVal } = req.common;
    
    if (!sessionVal || sessionVal.trim() === '') {
      return res.status(400).json({ error: 'Invalid sessionVal' });
    }

    
    logger.info(`user - delete `);
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
    
    
    const params = {
      id: userId
     };

    try {
      const query = mybatisMapper.getStatement('userMapper', 'deleteUser', params);
      const [result] = await pool.execute(query);
      const redisResult = await redis.del(sessionVal);
      logger.info(`Key "${sessionVal}" deleted. Result: ${redisResult}`);
    // result는 삭제된 키의 수를 반환합니다. 0이면 키가 존재하지 않았음을 의미합니다

    } catch (error) {
      logger.error('Error executing query:', error);
      throw error; 
    }
    
    logger.info(`User ${userId} delete successfully`);
    res.status(201).json({ message: 'User delete successfully' });

  } catch (error) {
    logger.error('Error in user delete: ' + error);
    res.status(500).json({ error  });
  }     

});


module.exports = router;

