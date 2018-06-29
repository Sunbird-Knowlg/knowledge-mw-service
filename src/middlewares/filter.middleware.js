var _ = require('underscore')
var filterService = require('../service/filterService')
var LOG = require('sb_logger_util')
var utilsService = require('../service/utilsService')
var path = require('path')
var filename = path.basename(__filename)

function addMetaFilters (req, res, next) {
  // If the request body has filter by metaFilter data, continue with the same filter, do not alter the values
  // else call the getMetaSearchJSON() function to generate the search string for the meta filters
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
    } else {
      next()
    }
    LOG.info(utilsService.getLoggerData({}, 'INFO',
      filename, 'addMetaFilters', 'added content meta filter', req.body.request.filters))
    console.log('req filters', req.body.request.filters)
    next()
  }
  // else {
}
function fetchFilterQuery (req, filter) {
  filterService.getMetadataFilterQuery(function (err, searchJSON) {
    console.log('err', err)
    console.log('channels', searchJSON)
    if (err) {
      LOG.error(utilsService.getLoggerData({}, 'ERROR', filename, 'addChannelFilters',
        'failed to get channels'))
    } else if (searchJSON && (!_.isEmpty(searchJSON))) {
      for (var key in searchJSON) {
        if (searchJSON.hasOwnProperty(key)) {
          var val = searchJSON[key]

          if (key === filter && val !== undefined) {
            console.log('key', key)
            var finalval = req.body.request.filters[key] = val
            console.log('finalval', finalval)
            return finalval
          }
        }
      }
    }
  })
}

function setFilterJSON () {
// Set the new filter Object for filter request body
}
module.exports.addMetaFilters = addMetaFilters
