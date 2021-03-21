const express = require('express');
const morgan = require('morgan');

const userRoutes = require('./routes/userRoutes');
const tourRoutes = require('./routes/tourRouter');
const app = express();
const json = express.json();

app.use(json);
app.use(morgan('dev'));

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

app.use((error,req,res,next)=>{
  const stack = error.stack.split("\n")[0] + error.stack.split("\n")[1] ;
  console.log(stack);
  res.status(error.status).json({
    status:'fail',
    message: error.message,
    stack
  })
})

module.exports = app;
