
//.env 쓰는경우 --> config 파일사용
//require('dotenv').config();
//const dbHost = process.env.DB_HOST;
//const dbUser = process.env.DB_USER;
//const dbPass = process.env.DB_PASS;
//const nodePort = process.env.NODE_PORT;

//console.log(`DB Host: ${dbHost}`);
//console.log(`DB User: ${dbUser}`);
//console.log(`Node Port: ${nodePort}`);

const config = require('config');

const dbConfig = config.get('db');
const serverConfig = config.get('server');

console.log(`DB Host: ${dbConfig.host}`);
console.log(`DB User: ${dbConfig.user}`);




const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const boardRoutes = require('./board');
const authRoutes = require('./auth');
const userRoutes = require('./user');
const voteRoutes = require('./vote');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 라우트 연결
app.use('/board', boardRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/vote', voteRoutes);

/*const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
*/

app.listen(serverConfig.port, () => {
  console.log(`Server running on port ${serverConfig.port}`);
});
