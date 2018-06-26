/**
 *  filterService - provides service methods for filters like channel filters
 *
 * author: Loganathan Shanmugam
 * email: loganathan.shanmugam@tarento.com
 */
var configUtil = require('sb-config-util')

function getMetaSearchData (callback) {
  var searchData = configUtil.getConfig('META_FILTER_REQUEST_JSON')
  callback(null, searchData)
}

module.exports.getMetaSearchData = getMetaSearchData
