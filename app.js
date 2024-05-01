const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middlewares/error');
const cors=require('cors');
const app = express();



// config
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: 'config/config.env' });
  }

app.use(express.json());
app.use(cookieParser('secret'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({credentials: true, origin: true, withCredentials: true }))
// app.use(dotenv())


const user = require('./routes/userRoute');


app.use('/api/v1', user);



// error middleware
app.use(errorMiddleware);

module.exports = app;