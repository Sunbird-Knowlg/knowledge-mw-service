var filterService = require('../service/filterService')
var utilsService = require('../service/utilsService')
var path = require('path')
var filename = path.basename(__filename)
var logger = require('sb_logger_util_v2')

function addMetaFilters (req, res, next) {
  // If the request body has filter by metaFilter data, continue with the same filter, do not alter the values
  // else call the fetchFilterQuery() function to generate the search string for the meta filters
  if (req && req.body && req.body.request && req.body.request.filters) {
    if (req.body.request.filters.channel === undefined) {
      fetchFilterQuery(req, 'channel')
    }
    if (req.body.request.filters.framework === undefined) {
      fetchFilterQuery(req, 'framework')
    }
    if (req.body.request.filters.contentType === undefined) {
      fetchFilterQuery(req, 'contentType')
    }
    if (req.body.request.filters.mimeType === undefined) {
      fetchFilterQuery(req, 'mimeType')
    }
    if (req.body.request.filters.resourceType === undefined) {
      fetchFilterQuery(req, 'resourceType')
    }
    logger.info({ msg: 'added content meta filter', metaFilters: req.body.request.filters }, req)
    next()
  } else {
    next()
  }
}
function fetchFilterQuery (req, filterProperty) {
  filterService.getMetadataFilterQuery(function (err, searchJSON) {
    if (err) {
      logger.error({ msg: 'failed to get fetch filter query', err })
    } else {
      for (var key in searchJSON) {
        var searchValue = searchJSON[key]
        if (key === filterProperty && searchValue !== undefined) {
          var finalFilterValue = req.body.request.filters[key] = searchValue
          return finalFilterValue
        }
      }
    }
  })
}

module.exports.addMetaFilters = addMetaFilters
