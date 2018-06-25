/**
 *  filterService - provides service methods for filters like channel filters
 *
 * author: Loganathan Shanmugam
 * email: loganathan.shanmugam@tarento.com
 */
var configUtil = require('sb-config-util')

function getMetaSearchString (callback) {
  var searchString = configUtil.getConfig('META_FILTER_QUERY_STRING')
  callback(null, searchString)
}

module.exports.getMetaSearchString = getMetaSearchString
