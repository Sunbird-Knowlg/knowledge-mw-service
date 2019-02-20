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
var _ = require('lodash')
var logger = require('sb_logger_util_v2')

const contentProvider = require('sb_content_provider_util')
var contentMetaProvider = require('./contentMetaFilter')
// TODO below configuration should to be refactored in a seperate file
var logFilePath = path.join(__dirname, './logs/microservice.log')
const contentProviderConfigPath = path.join(__dirname, '/config/contentProviderApiConfig.json')
var contentProviderApiConfig = JSON.parse(fs.readFileSync(contentProviderConfigPath))
const telemtryEventConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/telemetryEventConfig.json')))

var reqDataLimitOfContentUpload = '50mb'

const port = process.env.sunbird_content_service_port ? process.env.sunbird_content_service_port : 5000
const defaultChannel = process.env.sunbird_default_channel || 'sunbird'
const telemetryBaseUrl = process.env.sunbird_telemetry_service_local_url ? process.env.sunbird_telemetry_service_local_url : 'http://telemetry-service:9001/'
globalEkstepProxyBaseUrl = process.env.sunbird_content_plugin_base_url ? process.env.sunbird_content_plugin_base_url : 'https://qa.ekstep.in'

const contentRepoBaseUrl = process.env.sunbird_content_repo_api_base_url || 'https://qa.ekstep.in/api'
const contentRepoApiKey = process.env.sunbird_content_repo_api_key

const learnerServiceLocalBaseUrl = process.env.sunbird_learner_service_local_base_url
  ? process.env.sunbird_learner_service_local_base_url
  : 'http://learner-service:9000'

const searchServiceBaseUrl = process.env.sunbird_search_service_api_base_url || 'https://qa.ekstep.in/api/search'
const dialRepoBaseUrl = process.env.sunbird_dial_repo_api_base_url || 'https://qa.ekstep.in/api'
const pluginRepoBaseUrl = process.env.sunbird_plugin_repo_api_base_url || 'https://qa.ekstep.in/api'
const dataServiceBaseUrl = process.env.sunbird_data_service_api_base_url || 'https://qa.ekstep.in/api'
const languageServiceBaseUrl = process.env.sunbird_language_service_api_base_url || 'https://qa.ekstep.in/api/language'

const searchServiceApiKey = process.env.sunbird_search_service_api_key
const dialRepoApiKey = process.env.sunbird_dial_repo_api_key
const pluginRepoApiKey = process.env.sunbird_plugin_repo_api_key
const dataServiceApiKey = process.env.sunbird_data_service_api_key
const logLevel = process.env.sunbird_content_service_log_level || 'info'
const languageServiceApiKey = process.env.sunbird_language_service_api_key

const producerId = process.env.sunbird_environment + '.' + process.env.sunbird_instance + '.content-service'
const sunbirdPortalBaseUrl = process.env.sunbird_portal_base_url || 'https://staging.open-sunbird.org'
const lockExpiryTime = process.env.sunbird_lock_expiry_time || 3600
const contentServiceLocalBaseUrl = process.env.sunbird_content_service_local_base_url ? process.env.sunbird_content_service_local_base_url : 'http://content-service:5000'

configUtil.setContentProviderApi(contentProviderApiConfig.API)
configUtil.setConfig('CONTENT_REPO_BASE_URL', contentRepoBaseUrl)
configUtil.setConfig('TELEMETRY_BASE_URL', telemetryBaseUrl)
configUtil.setConfig('CONTENT_REPO_AUTHORIZATION_TOKEN', 'Bearer ' + contentRepoApiKey)
configUtil.setConfig('LEARNER_SERVICE_LOCAL_BASE_URL', learnerServiceLocalBaseUrl)
configUtil.setConfig('DIALCODE_GENERATE_MAX_COUNT', 20000)
configUtil.setConfig('CONTENT_UPLOAD_REQ_LIMIT', reqDataLimitOfContentUpload)
configUtil.setConfig('SEARCH_SERVICE_BASE_URL', searchServiceBaseUrl)
configUtil.setConfig('DIAL_REPO_BASE_URL', dialRepoBaseUrl)
configUtil.setConfig('PLUGIN_REPO_BASE_URL', pluginRepoBaseUrl)
configUtil.setConfig('DATA_SERVICE_BASE_URL', dataServiceBaseUrl)
configUtil.setConfig('SEARCH_SERVICE_AUTHORIZATION_TOKEN', 'Bearer ' + searchServiceApiKey)
configUtil.setConfig('DIAL_REPO_AUTHORIZATION_TOKEN', 'Bearer ' + dialRepoApiKey)
configUtil.setConfig('PLUGIN_REPO_AUTHORIZATION_TOKEN', 'Bearer ' + pluginRepoApiKey)
configUtil.setConfig('DATA_SERVICE_AUTHORIZATION_TOKEN', 'Bearer ' + dataServiceApiKey)
configUtil.setConfig('LANGUAGE_SERVICE_BASE_URL', languageServiceBaseUrl)
configUtil.setConfig('LANGUAGE_SERVICE_AUTHORIZATION_TOKEN', 'Bearer ' + languageServiceApiKey)
configUtil.setConfig('SUNBIRD_PORTAL_BASE_URL', sunbirdPortalBaseUrl)
configUtil.setConfig('LOCK_EXPIRY_TIME', lockExpiryTime)
configUtil.setConfig('CONTENT_SERVICE_LOCAL_BASE_URL', contentServiceLocalBaseUrl)

process.env.sunbird_cassandra_urls = process.env.sunbird_cassandra_urls || '127.0.0.1'
process.env.dial_code_image_temp_folder = 'temp'

logger.init({
  path: logFilePath,
  logLevel
})

logger.debug({ msg: `logger initialized with LEVEL= ${logLevel}` })

logger.debug({
  msg: 'environment variables',
  env: {
    port,
    defaultChannel,
    telemetryBaseUrl,
    globalEkstepProxyBaseUrl,
    contentRepoBaseUrl,
    learnerServiceLocalBaseUrl,
    searchServiceBaseUrl,
    dialRepoBaseUrl,
    pluginRepoBaseUrl,
    dataServiceBaseUrl,
    languageServiceBaseUrl,
    logLevel,
    logFilePath,
    producerId,
    sunbirdPortalBaseUrl,
    lockExpiryTime,
    contentServiceLocalBaseUrl,
    dialCodeImageTempFolder: process.env.dial_code_image_temp_folder
  }
})
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
      return bodyParser.json({
        limit: reqDataLimitOfContentUpload
      })(req, res, next)
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
require('./routes/pluginsRoutes')(app)
require('./routes/collaborationRoutes')(app)
require('./routes/lockRoutes')(app)
// this middleware route add after all the routes
require('./middlewares/proxy.middleware')(app)

function startServer() {
  this.server = http.createServer(app).listen(port, function () {
    logger.info({ msg: `server running at PORT ${port}` })
    logger.debug({ msg: `server started at ${new Date()}` })
    if (!process.env.sunbird_environment || !process.env.sunbird_instance) {
      logger.fatal({
        msg: `please set environment variable sunbird_environment, sunbird_instance' +
          'start service Eg: sunbird_environment = dev, sunbird_instance = sunbird`})
      process.exit(1)
    }
    contentMetaProvider.getMetaFilterConfig().then((configStr) => {
      configUtil.setConfig('META_FILTER_REQUEST_JSON', configStr)
    }).catch((err) => {
      logger.fatal({ msg: 'error in getting meta filters', err })
      process.exit(1)
    })
  })
}

// Create server
configUtil.setConfig('DEFAULT_CHANNEL', 'sunbird')
if (defaultChannel) {
  contentProvider.getChannel(defaultChannel, (err, res) => {
    var defaultHashTagId = _.get(res, 'result.response.content[0].hashTagId')
    if (defaultHashTagId) {
      configUtil.setConfig('DEFAULT_CHANNEL', defaultHashTagId)
    }
    logger.error({ msg: 'Error fetching default channel', err })
    logger.info({ msg: `DEFAULT_CHANNEL ${configUtil.getConfig('DEFAULT_CHANNEL')}` })
    startServer()
  })
} else {
  startServer()
}

// Close server, when we start for test cases
exports.close = function () {
  logger.debug({ msg: `server stopped at ${new Date()}` })
  this.server.close()
}

// Telemetry initialization
const telemetryBatchSize = parseInt(process.env.sunbird_telemetry_sync_batch_size, 10) || 20
telemtryEventConfig.pdata.id = producerId
const telemetryConfig = {
  pdata: telemtryEventConfig.pdata,
  method: 'POST',
  batchsize: telemetryBatchSize,
  endpoint: configUtil.getConfig('TELEMETRY'),
  host: configUtil.getConfig('TELEMETRY_BASE_URL'),
  authtoken: configUtil.getConfig('CONTENT_REPO_AUTHORIZATION_TOKEN')
}

logger.debug({ msg: 'Telemetry is initialized.' })
telemetry.init(telemetryConfig)
