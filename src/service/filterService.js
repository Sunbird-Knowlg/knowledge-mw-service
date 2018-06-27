/**
 *  filterService - provides service methods for filters like channel filters
 *
 * author: Loganathan Shanmugam
 * email: loganathan.shanmugam@tarento.com
 */
var configUtil = require('sb-config-util')

// function getChannelSearchString (callback) {
//   var searchString = configUtil.getConfig('CHANNEL_FILTER_QUERY_STRING')
//   callback(null, searchString)
// }

function getMetaSearchString (callback) {
  var searchString = configUtil.getConfig('META_FILTER_QUERY_STRING')
  console.log('searchString rev', searchString)
  callback(null, searchString)
}

// module.exports.getChannelSearchString = getChannelSearchString
module.exports.getMetaSearchString = getMetaSearchString
