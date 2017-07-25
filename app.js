var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var http = require('http');
var messageUtil = require('./service/messageUtil');
var respUtil = require('response_util');
var configUtil = require('sb-config-util');
var mongoDB = require('./mongoConnection');

var reqMsg = messageUtil.REQUEST;
var responseCode = messageUtil.RESPONSE_CODE;
var apiVersions = messageUtil.API_VERSION;
var reqDataLimitOfContentUplod = '30mb';

const port = process.env.sunbird_content_service_port ? process.env.sunbird_content_service_port : 5000;

global_ekstep_api_base_url = process.env.ekstep_api_base_url ? process.env.ekstep_api_base_url : "https://qa.ekstep.in";
global_ekstep_proxy_base_url = process.env.ekstep_proxy_base_url ? process.env.ekstep_proxy_base_url : "https://qa.ekstep.in";
global_ekstep_api_key = process.env.ekstep_api_key ? process.env.ekstep_api_key : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkNjNiMjgwZTQ1NDE0NDU4ODk4NzcwYzZhOGZiZjQ1MCJ9.Ji-22XcRrOiVy4dFAmE68wPxLkNmX4wKbTj_IB7fG6Y";

configUtil.setConfig('EKSTEP_BASE_URL', global_ekstep_api_base_url + '/api');
configUtil.setConfig('Authorization_TOKEN', 'Bearer ' + global_ekstep_api_key);

var app = express();

const isEkStepProxyRequest = function (req) {
  let url = req.url;
  return url && url.indexOf('/action/') > -1;
};

const bodyParserJsonMiddleware = function () {
  return function (req, res, next) {
    if (isEkStepProxyRequest(req)) {
      return next();
    } else {
        return bodyParser.json({limit: reqDataLimitOfContentUplod})(req, res, next);
    }
  };
};

app.use(bodyParserJsonMiddleware());
// app.use(bodyParser.urlencoded({
//     extended: true
// }));

app.use(methodOverride());

//Cache-Control, X-Requested-With these two headers required for upload file through fine-upload library
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, cid, user-id, x-auth, Cache-Control, X-Requested-With, *');

    if ('OPTIONS' === req.method) {
        res.sendStatus(200);
    } else {
        next();
    };
});

app.use(function (req, res, next) {
    res.setHeader('Connection', 'close');
    next();
});

require('./routes/courseRoutes')(app);
require('./routes/contentRoutes')(app);
require('./routes/utilsRoute')(app);
require('./routes/notesRoutes')(app);
require('./routes/conceptRoutes')(app);
require('./routes/searchRoutes')(app);
//last this middle in last
require('./middlewares/proxy.middleware')(app);



http.createServer(app).listen(port);

console.log('server running at PORT [%d]', port);
