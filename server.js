const dotenv = require('dotenv');
dotenv.config({path:'./config.env'}) //save all the setting to process env
const app = require('./app');
//const mongoose = require('mongoose');



//console.log(process.env.PORT);

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`App is running ${port}...`);
});