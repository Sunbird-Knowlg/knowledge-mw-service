var _ = require('underscore')
var filterService = require('../service/filterService')

function addMetaFilters (req, res, next) {
  // If the request body has filter by metaFilter data, continue with the same filter, do not alter the values

  // else call the getMetaSearchString() function to generate the search string for the meta filters
  filterService.getMetaSearchString(function () {

  })
}

module.exports.addMetaFilters = addMetaFilters
