var express = require('express')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
var http = require('http')
var path = require('path')
var cp = require('child_process')
var TelemetryUtil = require('sb_telemetry_util')
var telemetry = new TelemetryUtil()
var fs = require('fs')
var configUtil = require('sb-config-util')

const contentProviderConfigPath = path.join(__dirname, '/config/contentProviderApiConfig.json')
var contentProviderApiConfig = JSON.parse(fs.readFileSync(contentProviderConfigPath))
const telemtryEventConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/telemetryEventConfig.json')))

var reqDataLimitOfContentUpload = '30mb'

const port = process.env.sunbird_content_service_port ? process.env.sunbird_content_service_port : 5000

globalEkstepProxyBaseUrl = process.env.sunbird_content_plugin_base_url ? process.env.sunbird_content_plugin_base_url : 'https://qa.ekstep.in'

const contentProviderBaseUrl = process.env.sunbird_content_provider_api_base_url ? process.env.sunbird_content_provider_api_base_url : 'https://qa.ekstep.in/api'
const contentProviderApiKey = process.env.sunbird_content_provider_api_key

const learnerServiceApiKey = process.env.sunbird_learner_service_api_key
const learnerServiceBaseUrl = process.env.sunbird_learner_service_base_url ? process.env.sunbird_learner_service_base_url : 'https://dev.open-sunbird.org/api'

configUtil.setContentProviderApi(contentProviderApiConfig.API)
configUtil.setConfig('BASE_URL', contentProviderBaseUrl)
configUtil.setConfig('Authorization_TOKEN', 'Bearer ' + contentProviderApiKey)
configUtil.setConfig('LEARNER_SERVICE_BASE_URL', learnerServiceBaseUrl)
configUtil.setConfig('LEARNER_SERVICE_AUTHORIZATION_TOKEN', 'Bearer ' + learnerServiceApiKey)
configUtil.setConfig('DIALCODE_GENERATE_MAX_COUNT', 20000)
process.env.sunbird_cassandra_ips = process.env.sunbird_cassandra_ips || '127.0.0.1'
process.env.sunbird_cassandra_port = process.env.sunbird_cassandra_port || 9042
process.env.dial_code_image_temp_folder = 'temp'

var app = express()
const isEkStepProxyRequest = function (req) {
  let url = req.url
  const uploadAPI = configUtil.getConfig('UPLOAD_CONTENT_URI')
  const uploadUrlAPI = configUtil.getConfig('CONTENT_UPLOAD_URL_URI')
  return url && ((url.indexOf(uploadAPI) > -1 && !(url.indexOf(uploadUrlAPI) > -1)) || url.indexOf('/telemetry') > -1)
}

const bodyParserJsonMiddleware = function () {
  return function (req, res, next) {
    if (isEkStepProxyRequest(req)) {
      return next()
    } else {
      return bodyParser.json({limit: reqDataLimitOfContentUpload})(req, res, next)
    }
  }
}

app.use(bodyParserJsonMiddleware())
// app.use(bodyParser.urlencoded({
//     extended: true
// }));

app.use(methodOverride())

// Cache-Control, X-Requested-With these two headers required for upload file through fine-upload library
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization,' +
                                              'cid, user-id, x-auth, Cache-Control, X-Requested-With, *')

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  };
})

app.use(function (req, res, next) {
  res.setHeader('Connection', 'close')
  next()
})

require('./routes/courseRoutes')(app)
require('./routes/contentRoutes')(app)
require('./routes/conceptRoutes')(app)
require('./routes/searchRoutes')(app)
require('./routes/dialCodeRoutes')(app)
require('./routes/channelRoutes')(app)
require('./routes/frameworkRoutes')(app)
require('./routes/frameworkTermRoutes')(app)
require('./routes/frameworkCategoryInstanceRoutes')(app)

// this middleware route add after all the routes
require('./middlewares/proxy.middleware')(app)

// Create server
this.server = http.createServer(app).listen(port, function () {
  console.log('server running at PORT [%d]', port)
})

// Close server, when we start for test cases
exports.close = function () {
  this.server.close()
}

// schedular to run the failed and queued dialcode items in batch
require('./service/dialCode/scheduledBatchProcessor')

global.imageBatchProcess = cp.fork(path.join('service', 'dialCode', 'batchImageProcessor.js'))

global.imageBatchProcess.on('exit', function () {
  global.imageBatchProcess = cp.fork(path.join('service', 'dialCode', 'batchImageProcessor.js'))
})

// Telemetry initialization
const telemetryConfig = {
  pdata: telemtryEventConfig.pdata,
  method: 'POST',
  batchsize: process.env.sunbird_telemetry_sync_batch_size || 20,
  endpoint: configUtil.getConfig('TELEMETRY'),
  host: configUtil.getConfig('BASE_URL'),
  authtoken: configUtil.getConfig('Authorization_TOKEN')
}

telemetry.init(telemetryConfig)

function exitHandler (options, err) {
  console.log('Exit', options, err)
  telemetry.syncOnExit(function (err, res) {
    if (err) {
      process.exit()
    } else {
      process.exit()
    }
  })
}

// catches ctrl+c event
process.on('SIGINT', exitHandler)

// catches uncaught exceptions
process.on('uncaughtException', exitHandler)
