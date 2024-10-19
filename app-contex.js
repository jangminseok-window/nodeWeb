const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('config');
const dbConfig = config.get('db');
const redisConfig = config.get('redis');
const serverConfig = config.get('server');
const apiConfig = config.get('apiServer'); 
const logger = require('./log');
const express = require('express');
const db = require('./config/mysqlConn');
const cryptoUtil = require('./crypto/cryptoutil');
const mybatisMapper = require('./mybatis-wrapper');
const axios = require('axios');

const my_secret_key = dbConfig.secretkey;
const pool = db.init();

const router = express.Router();

mybatisMapper.createMapper(['./sql/user.xml']);

const { initRedisPool, getRedisPool } = require('./config/redisConn');

initRedisPool();

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');



const isProduction = serverConfig.name === 'live';
const isStabilized = serverConfig.status === 'stable';

// 캐시 설정
if (isProduction && isStabilized) {
    // 안정화된 운영 환경: 캐시 활성화
    app.enable('view cache');
  } else {
    // 개발 환경 또는 초기 운영 환경: 캐시 비활성화
    app.disable('view cache');
  }

module.exports = {
  config,
  dbConfig,
  logger,
  express,
  db,
  cryptoUtil,
  mybatisMapper,
  my_secret_key,
  pool,
  router,
  serverConfig,
  bodyParser,
  cors,
  getRedisPool,
  app,
  axios,
  apiConfig

};