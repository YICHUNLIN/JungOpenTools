require('dotenv').config()
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const Auth = require('./utils/auth')
const MContext = require('./context');
const context = new MContext();
var app = express();

app.use(cookieParser());
app.use(logger('dev'));


require('./api')(context, app, [
      cors(),
      express.json(), 
      express.urlencoded({ extended: false }), 
      (req, res, next) => {
          next();
      }
]);
module.exports = app;