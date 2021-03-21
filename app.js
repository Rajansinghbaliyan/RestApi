const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const userRoutes = require('./routes/userRoutes');
const tourRoutes = require('./routes/tourRouter');
const app = express();
const json = express.json({limit:'10kb'}); //restrict the size of the incoming request


const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this ip in 1 hour',
});

app.use('/api', limiter);
app.use(helmet());
app.use(json);

//sanitize the noSql query
app.use(mongoSanitize());

app.use(xss());

app.use(hpp());
//Data sanitization for noSql injection and xss
app.use(morgan('dev'));

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

app.use((error, req, res, next) => {
  const stack = error.stack.split('\n')[0] + error.stack.split('\n')[1];
  console.log(stack);
  res.status(error.status).json({
    status: 'fail',
    message: error.message,
    stack,
  });
});

module.exports = app;
