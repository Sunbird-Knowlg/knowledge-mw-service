/**
 *  filterService - provides service methods for filters like channel filters
 *
 * author: Loganathan Shanmugam
 * email: loganathan.shanmugam@tarento.com
 */
var configUtil = require('sb-config-util')

function getChannelSearchString (req, callback) {
  var searchString = configUtil.getConfig('CHANNEL_FILTER_STRING')
  // console.log('---------------------------------->FILTER IS', searchString)
  callback(null, searchString)
}

module.exports.getChannelSearchString = getChannelSearchString
