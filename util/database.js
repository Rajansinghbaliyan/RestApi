const mongoose = require('mongoose');



const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Database is connected to ${DB} ..`);
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = mongoose;
