var _ = require('underscore')
var filterService = require('../service/filterService')
var LOG = require('sb_logger_util')
var utilsService = require('../service/utilsService')
var path = require('path')
var _ = require('underscore')
var filename = path.basename(__filename)

function addMetaFilters (req, res, next) {
  // If the request body has filter by metaFilter data, continue with the same filter, do not alter the values
  // else call the getMetaSearchString() function to generate the search string for the meta filters
  if (req && req.body && req.body.request && req.body.request.filters && req.body.request.filters.channel) {
    next()
  } else {
    filterService.getMetaSearchString(function (err, searchJSON) {
      console.log('channels', searchJSON)
      if (err) {
        LOG.error(utilsService.getLoggerData({}, 'ERROR', filename, 'addChannelFilters',
          'failed to get channels'))
      } else if (searchJSON && (!_.isEmpty(searchJSON))) {
        req.body.request.filters.channel = searchJSON.channel
        LOG.info(utilsService.getLoggerData({}, 'INFO',
          filename, 'addChannelFilters', 'added channel filter', req.body.request.filters.channel))
      }
      next()
    })
  }
  // filterService.getMetaSearchString(function (req) {
  //   var searchObject = {
  //     channel: req.body.filter.channel,
  //     // framework: req.body.filter.framework,
  //     // creator: req.body.filter.creator,
  //     // language: req.body.filter.language
  //   }
  //   return searchObject
  // })
}

module.exports.addMetaFilters = addMetaFilters
