const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const passport = require('./auth/passport');
const middleware = require('./auth/middleware');
const apiRouter = require('./api/routes');
const authRouter = require('./auth/routes');
const adminRouter = require('./admin/routes');

const { CORS_OPTIONS } = require('./config');

const app = express();

app.use(cors(CORS_OPTIONS));
app.use(cookieParser());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use('/api', apiRouter);
app.use('/auth', authRouter);
app.use('/admin', middleware.isAdmin, adminRouter);

module.exports = app;
