var _ = require('underscore')
var filterService = require('../service/filterService')
var LOG = require('sb_logger_util')
var utilsService = require('../service/utilsService')
var path = require('path')
var filename = path.basename(__filename)

function addMetaFilters (req, res, next) {
  // If the request body has filter by metaFilter data, continue with the same filter, do not alter the values
  // else call the getMetaSearchJSON() function to generate the search string for the meta filters
  if (req && req.body && req.body.request && req.body.request.filters && req.body.request.filters.channel &&
    req.body.request.filters.framework && req.body.request.filters.contentType &&
    req.body.request.filters.mimeType && req.body.request.filters.resourceType) {
    next()
  } else {
    filterService.getMetaSearchData(function (err, searchJSON) {
      console.log('err', err)
      console.log('channels', searchJSON)
      if (err) {
        LOG.error(utilsService.getLoggerData({}, 'ERROR', filename, 'addChannelFilters',
          'failed to get channels'))
      } else if (searchJSON && (!_.isEmpty(searchJSON))) {
        if (req.body.request.filters.channel && searchJSON.channel !== undefined) {
          req.body.request.filters.channel = searchJSON.channel
        }
        if (req.body.request.filters.framework === undefined && searchJSON.framework !== undefined) {
          req.body.request.filters.framework = searchJSON.framework
        }

        if (req.body.request.filters.contentType === undefined && searchJSON.contentType !== undefined) {
          req.body.request.filters.contentType = searchJSON.contentType
        }
        if (req.body.request.filters.mimeType === undefined && searchJSON.mimeType !== undefined) {
          req.body.request.filters.mimeType = searchJSON.mimeType
        }
        if (req.body.request.filters.resourceType === undefined && searchJSON.channel !== undefined) {
          req.body.request.filters.resourceType = searchJSON.resourceType
        }
        LOG.info(utilsService.getLoggerData({}, 'INFO',
          filename, 'addChannelFilters', 'added channel filter', req.body.request.filters))
        console.log('req filters', req.body.request.filters)
      }
      next()
    })
  }
}

module.exports.addMetaFilters = addMetaFilters
