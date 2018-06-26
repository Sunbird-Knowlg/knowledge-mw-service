var _ = require('underscore')
var filterService = require('../service/filterService')

function addMetaFilters (req, res, next) {
  // If the request body has filter by metaFilter data, continue with the same filter, do not alter the values
  // else call the getMetaSearchData() function to generate the JSON Object for the meta filters
  filterService.getMetaSearchData(function () {
    // Generate JSON and return
    return getFilterJSON()
  })
}

function getFilterJSON () {
// return the new filter Object for filter request body
  return null
}
module.exports.addMetaFilters = addMetaFilters
