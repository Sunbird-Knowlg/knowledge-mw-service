var utilsService = require('./service/utilsService')
var LOG = require('sb_logger_util')
var path = require('path')
var filename = path.basename(__filename)
var _ = require('lodash')

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

  var configString = {}
  // Function to generate the Config String
  function generateConfigString (allowedMetadata, blackListedMetadata) {
    if ((allowedMetadata && allowedMetadata.length > 0) && (blackListedMetadata && blackListedMetadata.length > 0)) {
      configString = _.difference(allowedMetadata, blackListedMetadata)
      return configString
    } else if (allowedMetadata && allowedMetadata.length > 0) {
      configString = allowedMetadata
      return configString
    } else if (blackListedMetadata && blackListedMetadata.length > 0) {
      return { 'ne': blackListedMetadata }
    }
  }
  LOG.info(utilsService.getLoggerData({}, 'INFO',
    filename, 'getFilterConfig', 'config string', configString))
  // Check if the Filter Config service data is defined, if yes, create Object with it
  const filterConfigService = ''
  if (filterConfigService === '') {
    // generate JSON and return the configArray
    var metaFiltersArray = {
      'channel': [allowedChannels, blackListedChannels],
      'framework': [allowedFramework, blackListedFramework],
      'mimeType': [allowedMimetype, blackListedMimetype],
      'contentType': [allowedContenttype, blackListedContenttype],
      'resourceType': [allowedResourcetype, blackListedResourcetype]
    }
    var configArray = {}
    _.forOwn(metaFiltersArray, function (value, key) {
      configArray[key] = generateConfigString(value[0], value[1])
    })
    return configArray
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
