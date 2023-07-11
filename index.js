
const mongoose = require('mongoose');
const env = require("dotenv")
env.config()
mongoose.connect(process.env.mongo);


const path = require('path');
const express = require('express');
const app = express();
const session = require('express-session');
const morgan = require('morgan');
const nocache = require('nocache');
const config = require('./config/config');
require("dotenv").config()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//==================Session=====================//
app.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 24 * 10,
    },
  })
);

app.use(nocache());

app.use(express.static(path.join(__dirname, 'public')));

//===============For user routes=====================//

const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

//===============for admin routes====================//

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

//====================PORT==========================//

app.listen(process.env.port, () => {
  console.log('server is running');
});

