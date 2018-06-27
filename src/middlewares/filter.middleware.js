var _ = require('underscore')
var filterService = require('../service/filterService')
var LOG = require('sb_logger_util')
var utilsService = require('../service/utilsService')
var path = require('path')
var filename = path.basename(__filename)

function addMetaFilters (req, res, next) {
  // If the request body has filter by metaFilter data, continue with the same filter, do not alter the values
  // else call the getMetaSearchData() function to generate the JSON Object for the meta filters
  filterService.getMetaSearchData(function () {
    // Generate JSON and return
    return setFilterJSON()
  })
}

function setFilterJSON () {
// Set the new filter Object for filter request body
}
module.exports.addMetaFilters = addMetaFilters
