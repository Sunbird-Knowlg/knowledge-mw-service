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
var _ = require('underscore')
var filename = path.basename(__filename)
var utilsService = require('./service/utilsService')
var LOG = require('sb_logger_util')
const contentProvider = require('sb_content_provider_util')
// TODO below configuration should to be refactored in a seperate file

const contentProviderConfigPath = path.join(__dirname, '/config/contentProviderApiConfig.json')
var contentProviderApiConfig = JSON.parse(fs.readFileSync(contentProviderConfigPath))
const telemtryEventConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/telemetryEventConfig.json')))

var reqDataLimitOfContentUpload = '50mb'

const port = process.env.sunbird_content_service_port ? process.env.sunbird_content_service_port : 5000
const defaultChannel = process.env.sunbird_default_channel
const telemetryBaseUrl = process.env.sunbird_telemetry_service_local_url ? process.env.sunbird_telemetry_service_local_url : 'http://telemetry-service:9001/'
globalEkstepProxyBaseUrl = process.env.sunbird_content_plugin_base_url ? process.env.sunbird_content_plugin_base_url : 'https://qa.ekstep.in'

const contentProviderBaseUrl = process.env.sunbird_content_provider_api_base_url ? process.env.sunbird_content_provider_api_base_url : 'https://qa.ekstep.in/api'
const contentProviderApiKey = process.env.sunbird_content_provider_api_key

const learnerServiceLocalBaseUrl = process.env.sunbird_learner_service_local_base_url
  ? process.env.sunbird_learner_service_local_base_url
  : 'http://learner-service:9000'

const searchServiceBaseUrl = process.env.sunbird_search_service_api_base_url || 'https://qa.ekstep.in/api/search'
const dialServiceBaseUrl = process.env.sunbird_dial_service_api_base_url || 'https://qa.ekstep.in/api'

const whiteListedChannelList = process.env.sunbird_content_service_whitelisted_channels
const blackListedChannelList = process.env.sunbird_content_service_blacklisted_channels
const whitelistedframeworkList = process.env.sunbird_content_service_whitelisted_framework
const blacklistedframeworkList = process.env.sunbird_content_service_blacklisted_framework
const whitelistedLanguageList = process.env.sunbird_content_service_whitelisted_language
const blacklistedLanguageList = process.env.sunbird_content_service_blacklisted_language
const whitelistedCreatorList = process.env.sunbird_content_service_whitelisted_creator
const blacklistedCreatorList = process.env.sunbird_content_service_blacklisted_creator

const producerId = process.env.sunbird_environment + '.' + process.env.sunbird_instance + '.content-service'

configUtil.setContentProviderApi(contentProviderApiConfig.API)
configUtil.setConfig('BASE_URL', contentProviderBaseUrl)
configUtil.setConfig('TELEMETRY_BASE_URL', telemetryBaseUrl)
configUtil.setConfig('Authorization_TOKEN', 'Bearer ' + contentProviderApiKey)
configUtil.setConfig('LEARNER_SERVICE_LOCAL_BASE_URL', learnerServiceLocalBaseUrl)
configUtil.setConfig('DIALCODE_GENERATE_MAX_COUNT', 20000)
configUtil.setConfig('CONTENT_UPLOAD_REQ_LIMIT', reqDataLimitOfContentUpload)
configUtil.setConfig('SEARCH_SERVICE_BASE_URL', searchServiceBaseUrl)
configUtil.setConfig('DIAL_SERVICE_BASE_URL', dialServiceBaseUrl)
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

require('./routes/healthCheckRoutes')(app)
require('./routes/courseRoutes')(app)
require('./routes/contentRoutes')(app)
require('./routes/conceptRoutes')(app)
require('./routes/searchRoutes')(app)
require('./routes/dialCodeRoutes')(app)
require('./routes/channelRoutes')(app)
require('./routes/frameworkRoutes')(app)
require('./routes/frameworkTermRoutes')(app)
require('./routes/frameworkCategoryInstanceRoutes')(app)
require('./routes/dataExhaustRoutes')(app)
require('./routes/formRoutes')(app)
require('./routes/externalUrlMetaRoute')(app)
// this middleware route add after all the routes
require('./middlewares/proxy.middleware')(app)

// Create server
this.server = http.createServer(app).listen(port, function () {
  console.log('server running at PORT [%d]', port)
  if (!process.env.sunbird_environment || !process.env.sunbird_instance) {
    console.error('please set environment variable sunbird_environment, sunbird_instance  ' +
    'start service Eg: sunbird_environment = dev, sunbird_instance = sunbird')
    process.exit(1)
  }
  configUtil.setConfig('META_FILTER_QUERY_STRING', getMetaFilterConfig())
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
const telemetryBatchSize = parseInt(process.env.sunbird_telemetry_sync_batch_size, 10) || 20
telemtryEventConfig.pdata.id = producerId
const telemetryConfig = {
  pdata: telemtryEventConfig.pdata,
  method: 'POST',
  batchsize: telemetryBatchSize,
  endpoint: configUtil.getConfig('TELEMETRY'),
  host: configUtil.getConfig('TELEMETRY_BASE_URL'),
  authtoken: configUtil.getConfig('Authorization_TOKEN')
}

telemetry.init(telemetryConfig)

// function to generate the search string

function getMetaFilterConfig () {
  return setFilterJSONFromEnv()
}
function setFilterJSONFromEnv () {
  // Generate JSON and return
  return setFilterJSON()
}

function setFilterJSON () {

}
