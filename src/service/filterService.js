/**
 *  filterService - provides service methods for filters like channel filters
 *
 * author: Loganathan Shanmugam
 * email: loganathan.shanmugam@tarento.com
 */
var whiteListedChannelList = process.env.sunbird_content_service_whitelisted_channels
var blackListedChannelList = process.env.sunbird_content_service_blacklisted_channels

function getChannelSearchString (req, callback) {
  var searchString = generateChannelSearchString()
  callback(null, searchString)
}

function generateChannelSearchString () {
  var allowedChannels = whiteListedChannelList ? whiteListedChannelList.split(',') : []
  var blackListedChannels = blackListedChannelList ? blackListedChannelList.split(',') : []
  var searchString = {}
  if (allowedChannels && allowedChannels.length > 0) {
    searchString = allowedChannels
  } else if (blackListedChannels && blackListedChannels.length > 0) {
    // console.log({'ne': blaclListedChannels.join()})
    searchString = { 'ne': blackListedChannels }
  }
  return searchString
}

module.exports.getChannelSearchString = getChannelSearchString
