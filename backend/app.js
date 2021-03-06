const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const get_ip = require('ipware')().get_ip;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const session = require('express-session');
const mysqlSessionStore = require('./services/connection/session')(session);
const raven = require('raven');
const moment = require('moment');
const bearerToken = require('express-bearer-token');

const env = process.env.NODE_ENV || 'development';

const viewHelper = require('./services/view/helper');
const connectionHelper = require('./services/connection/helper');

const global = require('./services/app/global');
const appConfig = require('./services/app/config');

const sessConnectionOption = connectionHelper.getInfo('default');
const sessionStore = new mysqlSessionStore(Object.assign({
  schema: {
    tableName: 'session_tbl',
    columnNames: {
      session_id: 'sess_id',
      expires: 'sess_expires',
      data: 'sess_data',
      recency: 'sess_recency'
    }
  }
}, sessConnectionOption));

const contractStatusUpdateBatch = require('./batch/contractStatusUpdateBatch');

const index = require('./routes/index');
const apiCompany = require('./routes/api/company');
const apiUser = require('./routes/api/user');
const apiPortfolio = require('./routes/api/portfolio');
const apiProfile = require('./routes/api/profile');
const apiRequest = require('./routes/api/request');
const apiConstruction = require('./routes/api/construction');
const apiResource = require('./routes/api/resource');
const apiFile = require('./routes/api/file');
const apiAuthentication = require('./routes/api/authentication');
const apiPartner = require('./routes/api/partner');
const apiContract = require('./routes/api/contract');
const apiTest = require('./routes/api/test');
const apiConstructor = require('./routes/api/constructor');
const apiCorrespondent = require('./routes/api/correspondent');
const apiWebhook = require('./routes/api/webhook');
const apiDashboard = require('./routes/api/dashboard');
const apiMagazine = require('./routes/api/magazine');
const apiEstimate = require('./routes/api/estimate');

const authMiddleware = require('./middlewares/auth');

raven.config('https://0f22cdb7d6f14189b765414605f7eb36:a76850f0a2e94b97a2dcc95da88af720@sentry.io/159366').install();

let app = express();
app.locals.moment = moment;
app.locals.env = env;
viewHelper.register(app.locals);

// oauth key setting.
global.auth = app.locals.auth = {
  facebook: appConfig.auth.facebook[env],
  naver: appConfig.auth.naver[env],
};

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(raven.requestHandler());
// uncomment after placing your favicon in /public

app.use(function (req, res, next) {
  let faviconFile = 'favicon-2.ico';
  if (req.headers.host.indexOf('irudasolution') > 0) faviconFile = 'favicon-iruda.ico';
  app.use(favicon(path.join(__dirname, 'public', faviconFile)));
  req.ip = get_ip(req).clientIp;
  next();
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(bearerToken());
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(session({
  key: appConfig.sess_key,
  secret: appConfig.sess_secure,
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}));

app.use('/', index);
app.use(/^\/(?:(?!api)(.*))\/?(?=\/|$)/i, index);

app.use('/api/company', apiCompany);
app.use('/api/user', apiUser);
app.use('/api/portfolio', apiPortfolio);
app.use('/api/profile', apiProfile);
app.use('/api/request', apiRequest);
app.use('/api/construction', apiConstruction);
app.use('/api/resource', apiResource);
app.use('/api/file/', apiFile);
app.use('/api/authentication/', apiAuthentication);
app.use('/api/partner', apiPartner);
app.use('/api/contract', apiContract);
app.use('/api/test', apiTest);
app.use('/api/constructor', apiConstructor);
app.use('/api/correspondent', apiCorrespondent);
app.use('/api/webhook', apiWebhook);
app.use('/api/dashboard', apiDashboard);
app.use('/api/magazine', apiMagazine);
app.use('/api/estimate', apiEstimate);

// catch 404 and forward to error handler
app.use(function (req, res) {
  //let err = new Error('Not Found');
  //err.status = 404;
  // next(err);
  res.redirect('/');
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.error(err.message);
  res.json({
    error: err.message,
    code: err.status || 500
  });
});

module.exports = app;
