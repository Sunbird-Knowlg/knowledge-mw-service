/**
 *  filterService - provides service methods for filters like channel filters
 *
 * author: Loganathan Shanmugam
 * email: loganathan.shanmugam@tarento.com
 */
var _ = require('underscore')
var configUtil = require('sb-config-util')

function getRequestChannelArray (channel) {
  var reqArray = []
  var isWhitelistRequest = checkWhitelistRequest(channel)
  if (!isWhitelistRequest) {
    var reqObj = _.values(channel)
    if (_.isArray(reqObj[0])) {
      reqArray = reqObj[0]
    } else {
      reqArray = reqObj
    }
  } else {
    var reqObj1 = channel
    if (_.isArray(reqObj1)) {
      reqArray = reqObj1
    } else {
      reqArray.push(reqObj1)
    }
  }
  return reqArray
}

function checkWhitelistRequest (channel) {
  var isWhitelistRequest = true
  _.findKey(channel, function (value, key) {
    isWhitelistRequest = !(key === 'ne' || key === 'notEquals' || key === '!=')
    return isWhitelistRequest
  })
  return isWhitelistRequest
}

function getChannelSearchString (req, callback) {
  var channelFilterInreq = []
  var isWhitelistRequest = null
  if (req && req.body && req.body.request && req.body.request.filters && req.body.request.filters.channel) {
    var channel = req.body.request.filters.channel
    channelFilterInreq = getRequestChannelArray(channel)
    isWhitelistRequest = checkWhitelistRequest(channel)
  }
  var configArray = configUtil.getConfig('CHANNEL_FILTER_CONFIG_ARRAY')
  var isWhitelisted = configUtil.getConfig('CHANNEL_IS_WHITELIST')
  var isChannelFilterEnabled = true
  var searchString = []
  if (isWhitelisted) {
    if (isWhitelistRequest) {
      searchString = _.intersection(configArray, channelFilterInreq)
    } else if (channelFilterInreq.length > 0) {
      searchString = _.difference(configArray, channelFilterInreq)
    } else {
      searchString = configArray
    }
  } else if (configArray.length > 0) {
    if (isWhitelistRequest) {
      searchString = _.difference(channelFilterInreq, configArray)
    } else if (channelFilterInreq.length > 0) {
      searchString = _.union(configArray, channelFilterInreq)
    } else {
      searchString = configArray
    }
  } else {
    if (channelFilterInreq.length > 0) {
      searchString = channelFilterInreq
    } else {
      isChannelFilterEnabled = false
      searchString = null
    }
  }
  console.log('------------>', searchString)
  callback(null, searchString, isChannelFilterEnabled)
}

module.exports.getChannelSearchString = getChannelSearchString
