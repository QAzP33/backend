const express = require('express');
const cors = require('cors');
const path = require('path');
const pinoHttp = require('pino-http');

const logger = require('./utils/logger')('App');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const adminRouter = require('./routes/admin');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        req.body = req.raw.body;
        return req;
      },
    },
  })
);
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/healthcheck', (req, res) => {
//   res.status(200);
//   res.send('OK');
// });
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/admin', adminRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  req.log.error(err);
  if (err.status) {
    res.status(err.status).json({
      message: err.message,
    });
    return;
  }
  res.status(500).json({
    message: '伺服器錯誤',
  });
});

module.exports = app;
