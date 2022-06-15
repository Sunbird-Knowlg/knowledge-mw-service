var utilsService = require('./service/utilsService')
var LOG = require('sb_logger_util')
var path = require('path')
var filename = path.basename(__filename)
var _ = require('lodash')
var configHelper = require('./helpers/configHelper.js')
var cron = require('node-cron')
var channelRefreshCronStr = process.env.sunbird_content_service_channel_refresh_cron
var ischannelRefreshEnabled = false
// Function to generate the Config Array

var generateConfigString =  ( async function(metaFiltersArray) {
    var configArray = {}
    _.forOwn(metaFiltersArray, function (value, key) {
      var allowedMetadata = value[0]
      var blackListedMetadata = value[1]
      if (key === 'channel' && _.includes(allowedMetadata, '$.instance.all')) {
        if (channelRefreshCronStr && !ischannelRefreshEnabled) {
          setChannelRefreshTask()
          ischannelRefreshEnabled = true
        }
        LOG.info(utilsService.getLoggerData({}, 'INFO',
          filename, 'generateConfigString', 'allowed channels', allowedMetadata))
          var allChannels = await (configHelper.getAllChannelsFromAPI())
          allowedMetadata = _.pull(allowedMetadata, '$.instance.all').concat(allChannels)
          LOG.info(utilsService.getLoggerData({}, 'INFO',
            filename, 'generateConfigString', 'all whitelisted channels count', allowedMetadata.length))
              configArray[key] = getconfigStringFromMeta(allowedMetadata, blackListedMetadata)
       
      } else {
        LOG.info(utilsService.getLoggerData({}, 'INFO',
          filename, 'generateConfigString', 'allowed metadata', allowedMetadata))
        configArray[key] = getconfigStringFromMeta(allowedMetadata, blackListedMetadata)
      }
    })
    LOG.info(utilsService.getLoggerData({}, 'INFO',
      filename, 'generateConfigString', 'config array', configArray))
    return configArray
})

/**
 * This function generates the config string for given allowed and blacklisted channels
 * @param allowedMetadata  array of metadata item to be allowed in filters
 * @param blackListedMetadata  array of metadata item to be blacklisted or ignored
 * @returns Js object or array which contains the allowed whitelisted meta items
 */
function getconfigStringFromMeta (allowedMetadata, blackListedMetadata) {
  var configString = {}
  if ((allowedMetadata && allowedMetadata.length > 0) && (blackListedMetadata && blackListedMetadata.length > 0)) {
    configString = _.difference(allowedMetadata, blackListedMetadata)
  } else if (allowedMetadata && allowedMetadata.length > 0) {
    configString = allowedMetadata
  } else if (blackListedMetadata && blackListedMetadata.length > 0) {
    configString = { 'ne': blackListedMetadata }
  }
  LOG.info(utilsService.getLoggerData({}, 'INFO',
    filename, 'getconfigStringFromMeta', 'config string', configString))
  return configString
}

// function to generate the search filter and return JSON Object
function getMetaFilterConfig () {
  LOG.info(utilsService.getLoggerData({}, 'INFO',
    filename, 'getMetaFilterConfig', 'environment info', process.env))
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

  // Check if the Filter Configservice data is defined, if yes, create Object with it
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

/**
 * This function executes the scheduler cron job to refresh the whitelisted
 * channels based given cron interval string 'channelRefreshCronStr'
 */
function setChannelRefreshTask () {
  cron.schedule(channelRefreshCronStr, function () {
    LOG.info(utilsService.getLoggerData({}, 'INFO',
      filename, 'setChannelRefreshTask', 'running scheduler task', channelRefreshCronStr))
    getMetaFilterConfig()
  })
}

module.exports.getMetaFilterConfig = getMetaFilterConfig
