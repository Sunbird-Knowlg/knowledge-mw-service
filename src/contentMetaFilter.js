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
  var allowedFramework = process.env.sunbird_content_filter_framework_whitelist
    ? process.env.sunbird_content_filter_framework_whitelist.split(',') : []
  var blackListedFramework = process.env.sunbird_content_filter_framework_blacklist
    ? process.env.sunbird_content_filter_framework_blacklist.split(',') : []
  var allowedMimetype = process.env.sunbird_content_filter_mimetype_whitelist
    ? process.env.sunbird_content_filter_mimetype_whitelist.split(',') : []
  var blackListedMimetype = process.env.sunbird_content_filter_mimetype_blacklist
    ? process.env.sunbird_content_filter_mimetype_blacklist.split(',') : []
  var allowedContenttype = process.env.sunbird_content_filter_contenttype_whitelist
    ? process.env.sunbird_content_filter_contenttype_whitelist.split(',') : []
  var blackListedContenttype = process.env.sunbird_content_filter_contenttype_blacklist
    ? process.env.sunbird_content_filter_contenttype_blacklist.split(',') : []
  var allowedResourcetype = process.env.sunbird_content_filter_resourcetype_whitelist
    ? process.env.sunbird_content_filter_resourcetype_whitelist.split(',') : []
  var blackListedResourcetype = process.env.sunbird_content_filter_resourcetype_blacklist
    ? process.env.sunbird_content_filter_resourcetype_blacklist.split(',') : []

  var metaFiltersArray = [[allowedChannels, blackListedChannels],
    [allowedFramework, blackListedFramework],
    [allowedMimetype, blackListedMimetype],
    [allowedContenttype, blackListedContenttype],
    [allowedResourcetype, blackListedResourcetype]]
  var configArray = []
  _.forEach(metaFiltersArray, function (value) {
    configArray.push(generateConfigString(value[0], value[1]))
  })

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
      configString = { 'ne': blackListedMetadata }
      return configString
    }
  }
  LOG.info(utilsService.getLoggerData({}, 'INFO',
    filename, 'getFilterConfig', 'config string', configString))
  // Check if the Filter Config service data is defined, if yes, create Object with it
  const filterConfigService = ''
  if (filterConfigService === '') {
    // Call getFilterJSONFromEnv to generate a JSON Object
    return getFilterJSONFromEnv(configArray)
  } else {
    // return getFilterJSONfromConfigService()
    return getFilterJSONfromConfigService()
  }
}

// Generate JSON and return
function getFilterJSONFromEnv (metaConfigData) {
  var metaFilterKey = ['channel', 'framework', 'mimeType', 'contentType', 'resourceType']
  var generateJSON = _.zipObject(metaFilterKey, metaConfigData)
  //   console.log('genreated json', generateJSON)
  return generateJSON
}

function getFilterJSONfromConfigService () {
  // Generate JSON from Config Service and return
  throw new Error('Config service is unavailable')
}

module.exports.getMetaFilterConfig = getMetaFilterConfig
