var filterService = require('../service/filterService')
// var LOG = require('sb_logger_util')
// var utilsService = require('../service/utilsService')
// var path = require('path')
// var filename = path.basename(__filename)

function addMetaFilters (req, res, next) {
  // If the request body has filter by metaFilter data, continue with the same filter, do not alter the values

  // else call the getMetaSearchString() function
  filterService.getMetaSearchString()
  // This function will generate the search string for the meta filters
}
module.exports.addChannelFilters = addMetaFilters
