var filterService = require('../service/filterService')

function addMetaFilters (req, res, next) {
  // If the request body has filter by metaFilter data, continue with the same filter, do not alter the values
  // else call the getMetaSearchString() function
  filterService.getMetaSearchString()
  // This function will generate the search string for the meta filters
}
