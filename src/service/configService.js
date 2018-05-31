/**
 *  configService - provides service methods for configurations like channel filters
 *
 * author: Loganathan Shanmugam
 * email: loganathan.shanmugam@tarento.com
 */
var whiteListedChannelList = process.env.sunbird_content_service_whitelisted_channels_new
var blackListedChannelList = process.env.sunbird_content_service_blacklisted_channels_new

function getSearchString (req, callback) {
  var searchString = generateSearchString()
  callback(null, searchString)
}
function generateSearchString () {
  var allowedChannels = whiteListedChannelList ? whiteListedChannelList.split(',') : []
  var blaclListedChannels = blackListedChannelList ? blackListedChannelList.split(',') : []
  var searchString = {}
  if (allowedChannels && allowedChannels.length > 0) {
    searchString = allowedChannels
  } else if (blaclListedChannels && blaclListedChannels.length > 0) {
    // console.log({'ne': blaclListedChannels.join()})
    searchString = {'ne': blaclListedChannels}
  }
  return searchString
}

module.exports.getSearchString = getSearchString
