const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const boardRoutes = require('./board');
const authRoutes = require('./auth');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 라우트 연결
app.use('/board', boardRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});