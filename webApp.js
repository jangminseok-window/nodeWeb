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
  cors
      }  = require('./app-contex');



logger.info(`web DB Host: ${dbConfig.host}`);
logger.info(`DB User: ${dbConfig.user}`);




//const boardRoutes = require('./board');
//const authRoutes = require('./auth');
const userRoutes = require('./user');
//const voteRoutes = require('./vote');

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 라우트 연결
//app.use('/board', boardRoutes);
//app.use('/auth', authRoutes);
app.use('/user', userRoutes);
//app.use('/vote', voteRoutes);


app.listen(serverConfig.port, () => {
  console.log(`Server running on port ${serverConfig.port}`);
});
