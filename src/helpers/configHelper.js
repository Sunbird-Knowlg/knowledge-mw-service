var path = require('path')
var filename = path.basename(__filename)
var utilsService = require('../service/utilsService')
var LOG = require('sb_logger_util')
const contentProvider = require('sb_content_provider_util')
var async = require('async')
var _ = require('lodash')
var configUtil = require('sb-config-util')
var channelRefreshCronStr = process.env.sunbird_content_service_channel_refresh_cron
var cron = require('node-cron')
const whiteListedChannelList = process.env.sunbird_content_service_whitelisted_channels
const blackListedChannelList = process.env.sunbird_content_service_blacklisted_channels
var ischannelRefreshEnabled = false

/**
 * This function executes the org search lms API to get all orgs
 * @param requestObj  js object which contains the search request with filters,offset,limit,query etc
 * @param cb callback after success or error
 */
function getRootOrgs (requestObj, cb) {
  LOG.info(utilsService.getLoggerData({}, 'INFO',
    filename, 'getRootOrgs', 'getRootOrgs called', requestObj))
  contentProvider.getAllRootOrgs(requestObj, (err, res) => {
    if (!err && res && res.result.response.count > 0 && res.result.response.content) {
      cb(err, res)
    } else {
      LOG.error(utilsService.getLoggerData({}, 'ERROR',
        filename, 'getRootOrgs', 'error in getting root orgs.', err))
      process.exit(1)
    }
  })
}

/**
 * This function returns the config string based on condition for channel filters which
 * contains the whitelisted channels
 * @returns Js object or array which contains the allowed whitelisted channels
 */
function getFilterConfig (cb) {
  LOG.info(utilsService.getLoggerData({}, 'INFO',
    filename, 'getFilterConfig', 'environment info', process.env))
  var allowedChannels = whiteListedChannelList ? whiteListedChannelList.split(',') : []
  var blackListedChannels = blackListedChannelList ? blackListedChannelList.split(',') : []
  if (_.includes(allowedChannels, '$.instance.all')) {
    if (channelRefreshCronStr && !ischannelRefreshEnabled) {
      setChannelRefreshTask()
      ischannelRefreshEnabled = true
    }
    LOG.info(utilsService.getLoggerData({}, 'INFO',
      filename, 'getFilterConfig', 'allowed channels', allowedChannels))
    getAllChannelsFromAPI(function (err, allChannels) {
      if (err) {
        console.log(err)
        LOG.error(utilsService.getLoggerData({}, 'ERROR',
          filename, 'getFilterConfig', 'getAllChannelsFromAPI callback', err))
      }
      allowedChannels = _.pull(allowedChannels, '$.instance.all').concat(allChannels)
      LOG.info(utilsService.getLoggerData({}, 'INFO',
        filename, 'getFilterConfig', 'all whitelisted channels count', allowedChannels.length))
      cb(null, getconfigStringFromChannels(allowedChannels, blackListedChannels))
    })
  } else {
    LOG.info(utilsService.getLoggerData({}, 'INFO',
      filename, 'getFilterConfig', 'allowed channels', allowedChannels))
    cb(null, getconfigStringFromChannels(allowedChannels, blackListedChannels))
  }
}

/**
 * This function generates the config string for given allowed and blacklisted channels
 * @param allowedChannels  array of channels to be allowed in filters
 * @param blacklistedchannels  array of channels to be blacklisted or ignored
 * @returns Js object or array which contains the allowed whitelisted channels
 */
function getconfigStringFromChannels (allowedChannels, blackListedChannels) {
  var configString = {}
  if ((allowedChannels && allowedChannels.length > 0) && (blackListedChannels && blackListedChannels.length > 0)) {
    configString = _.difference(allowedChannels, blackListedChannels)
  } else if (allowedChannels && allowedChannels.length > 0) {
    configString = allowedChannels
  } else if (blackListedChannels && blackListedChannels.length > 0) {
    configString = { 'ne': blackListedChannels }
  }
  LOG.info(utilsService.getLoggerData({}, 'INFO',
    filename, 'getconfigStringFromChannels', 'config string', configString))
  return configString
}

/**
 * This method gets all channels through 'getRootOrgs' method response
 * data asynchronously and return callback
 * @param cb callback method which takes error and allchannels as param
 * @returns callback
 */
function getAllChannelsFromAPI (cb) {
  var limit = 200
  var offset = 0
  var allChannels = []
  var channelReqObj = {
    'request': {
      'filters': { 'isRootOrg': true },
      'offset': offset,
      'limit': limit
    }
  }
  LOG.info(utilsService.getLoggerData({}, 'INFO',
    filename, 'getAllChannelsFromAPI', 'fetching all channels req', channelReqObj))
  getRootOrgs(channelReqObj, function (err, res) {
    if (err) {
      cb(err, null)
    }
    const orgCount = res.result.response.count
    allChannels = _.without(_.map(res.result.response.content, 'hashTagId'), null)
    // if more orgs are there get them iteratively using async
    if (limit < orgCount) {
      var channelReqArr = []
      while ((offset + limit) < orgCount) {
        offset = offset + limit
        channelReqObj.request.offset = offset
        channelReqArr.push(_.cloneDeep(channelReqObj))
      }
      async.map(channelReqArr, getRootOrgs, function (err, mappedResArr) {
        if (err) {
          LOG.error(utilsService.getLoggerData({}, 'ERROR',
            filename, 'getFilterConfig', 'getAllChannelsFromAPI callback', err))
        }
        /** extract hashTagId which represents the channelID from each response
        * of responseMap to generate the whitelisted channels array
        * */
        _.forEach(mappedResArr, function (item) {
          allChannels.push(_.map(item.result.response.content, 'hashTagId'))
        })
        allChannels = _.without(_.flatten(allChannels), null)
        LOG.info(utilsService.getLoggerData({}, 'INFO',
          filename, 'getAllChannelsFromAPI', 'all channels arr', allChannels))
        cb(null, allChannels)
      })
    } else {
      LOG.info(utilsService.getLoggerData({}, 'INFO',
        filename, 'getAllChannelsFromAPI', 'all channels arr', allChannels))
      cb(null, allChannels)
    }
  })
}

/**
 * This method sets the given channel filter value to the config utils
 * @param configString configstring which contains the whitelisted channels
 */
function updateConfig () {
  getFilterConfig(function (err, configString) {
    if (err) {
      LOG.error(utilsService.getLoggerData({}, 'ERROR',
        filename, 'updateConfig', 'error', err))
    }
    LOG.info(utilsService.getLoggerData({}, 'INFO',
      filename, 'updateConfig', 'config string', configString))
    configUtil.setConfig('CHANNEL_FILTER_QUERY_STRING', configString)
  })
}

/**
 * This function executes the scheduler cron job to refresh the whitelisted
 * channels based given cron interval string 'channelRefreshCronStr'
 */
function setChannelRefreshTask () {
  cron.schedule(channelRefreshCronStr, function () {
    LOG.info(utilsService.getLoggerData({}, 'INFO',
      filename, 'setChannelRefreshTask', 'running scheduler task', channelRefreshCronStr))
    updateConfig()
  })
}

module.exports = {
  updateConfig: updateConfig,
  getFilterConfig: getFilterConfig
}
