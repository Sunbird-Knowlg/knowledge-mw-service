/**
 *  filterService - provides service methods for filters like channel filters
 *
 * author: Loganathan Shanmugam
 * email: loganathan.shanmugam@tarento.com
 */
var configUtil = require('sb-config-util')

function getMetadataFilterQuery (callback) {
  var filterQuery = configUtil.getConfig('META_FILTER_REQUEST_JSON')
  callback(null, filterQuery)
}

module.exports.getMetadataFilterQuery = getMetadataFilterQuery
