/**
 *  filterService - provides service methods for filters like channel filters
 *
 * author: Loganathan Shanmugam
 * email: loganathan.shanmugam@tarento.com
 */
var configUtil = require('sb-config-util')

function getMetaSearchData (callback) {
  var searchString = configUtil.getConfig('META_FILTER_QUERY_STRING')
  console.log('searchString rev', searchString)
  callback(null, searchString)
}

// module.exports.getChannelSearchString = getChannelSearchString
module.exports.getMetaSearchData = getMetaSearchData
