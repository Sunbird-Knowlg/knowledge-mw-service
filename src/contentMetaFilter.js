var utilsService = require('./service/utilsService')
var LOG = require('sb_logger_util')
var path = require('path')
var filename = path.basename(__filename)
var _ = require('lodash')

// Function to generate the Config Array
function generateConfigString (metaFiltersArray) {
  var configArray = {}
  _.forOwn(metaFiltersArray, function (value, key) {
    const allowedMetadata = value[0]
    const blackListedMetadata = value[1]
    if ((allowedMetadata && allowedMetadata.length > 0) && (blackListedMetadata && blackListedMetadata.length > 0)) {
      configArray[key] = _.difference(allowedMetadata, blackListedMetadata)
    } else if (allowedMetadata && allowedMetadata.length > 0) {
      configArray[key] = allowedMetadata
    } else if (blackListedMetadata && blackListedMetadata.length > 0) {
      configArray[key] = { 'ne': blackListedMetadata }
    }
  })
  LOG.info(utilsService.getLoggerData({}, 'INFO',
    filename, 'getFilterConfig', 'config array', configArray))
  return configArray
}
// function to generate the search filter and return JSON Object
function getMetaFilterConfig () {
  LOG.info(utilsService.getLoggerData({}, 'INFO',
    filename, 'getFilterConfig', 'environment info', process.env))
  var allowedChannels = process.env.sunbird_content_service_whitelisted_channels
    ? process.env.sunbird_content_service_whitelisted_channels.split(',') : []
  var blackListedChannels = process.env.sunbird_content_service_blacklisted_channels
    ? process.env.sunbird_content_service_blacklisted_channels.split(',') : []
  var allowedFramework = process.env.sunbird_content_service_whitelisted_framework
    ? process.env.sunbird_content_service_whitelisted_framework.split(',') : []
  var blackListedFramework = process.env.sunbird_content_service_blacklisted_framework
    ? process.env.sunbird_content_service_blacklisted_framework.split(',') : []
  var allowedMimetype = process.env.sunbird_content_service_whitelisted_mimetype
    ? process.env.sunbird_content_service_whitelisted_mimetype.split(',') : []
  var blackListedMimetype = process.env.sunbird_content_service_blacklisted_mimetype
    ? process.env.sunbird_content_service_blacklisted_mimetype.split(',') : []
  var allowedContenttype = process.env.sunbird_content_service_whitelisted_contenttype
    ? process.env.sunbird_content_service_whitelisted_contenttype.split(',') : []
  var blackListedContenttype = process.env.sunbird_content_service_blacklisted_contenttype
    ? process.env.sunbird_content_service_blacklisted_contenttype.split(',') : []
  var allowedResourcetype = process.env.sunbird_content_service_whitelisted_resourcetype
    ? process.env.sunbird_content_service_whitelisted_resourcetype.split(',') : []
  var blackListedResourcetype = process.env.sunbird_content_service_blacklisted_resourcetype
    ? process.env.sunbird_content_service_blacklisted_resourcetype.split(',') : []

  // Check if the Filter Config service data is defined, if yes, create Object with it
  const filterConfigService = null
  if (filterConfigService === null) {
    // generate JSON and return the configArray
    var metaFiltersArray = {
      'channel': [allowedChannels, blackListedChannels],
      'framework': [allowedFramework, blackListedFramework],
      'mimeType': [allowedMimetype, blackListedMimetype],
      'contentType': [allowedContenttype, blackListedContenttype],
      'resourceType': [allowedResourcetype, blackListedResourcetype]
    }
    return generateConfigString(metaFiltersArray)
  } else {
    // return getFilterJSONfromConfigService()
    return getFilterJSONfromConfigService()
  }
}

function getFilterJSONfromConfigService () {
  // Generate JSON from Config Service and return the filter Object else throw errors
  throw new Error('Config service is unavailable')
}

module.exports.getMetaFilterConfig = getMetaFilterConfig
