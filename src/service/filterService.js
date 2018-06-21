/**
 *  filterService - provides service methods for filters like channel filters
 *
 * author: Loganathan Shanmugam
 * email: loganathan.shanmugam@tarento.com
 */
var configUtil = require('sb-config-util')

function getChannelSearchString (callback) {
  var searchString = configUtil.getConfig('CHANNEL_FILTER_QUERY_STRING')
  console.log('searchString:', searchString)
  callback(null, searchString)
}

function getMetaSearchString () {}

module.exports.getMetaSearchString = getMetaSearchString
module.exports.getChannelSearchString = getChannelSearchString
