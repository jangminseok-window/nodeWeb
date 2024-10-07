// 전체 프레임워크에서 고정으로 사용되는 값설정 필요시 각 router-js에서 정의해서 사용
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
  router,
  serverConfig,
  bodyParser,
  cors,
  getRedisPool
 
  }  = require('./app-contex');

const { v4: uuidv4 } = require('uuid'); // UUID 생성을 위해 추가

logger.info(`WebApp Start---->`);

logger.info(`prometeus Start---->`);

const promClient = require('prom-client');
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();
const app = express();

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});


//logger.info(`web DB Host: ${dbConfig.host}`);
//logger.info(`DB User: ${dbConfig.user}`);



app.use((req, res, next) => {
 //req에 공통으로 설정해야될 사항 설정
  req.common = {
    sessionVal: ``
  };
  next();
});




//const boardRoutes = require('./board');
const authRoutes = require('./auth');
const userRoutes = require('./user');
//const voteRoutes = require('./vote');




app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 라우트 연결
//app.use('/board', boardRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
//app.use('/vote', voteRoutes);


app.listen(serverConfig.port, () => {
  console.log(`Server running on port ${serverConfig.port}`);
});
