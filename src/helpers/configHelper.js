var path = require('path')
var filename = path.basename(__filename)
var utilsService = require('../service/utilsService')
var LOG = require('sb_logger_util')
const contentProvider = require('sb_content_provider_util')
var async = require('async')
var _ = require('lodash')

/**
 * This function executes the org search lms API to get all orgs
 * @param requestObj  js object which contains the search request with filters,offset,limit,query etc
 * @param cb callback after success or error
 */
function getRootOrgs (requestObj, cb) {
  LOG.info(utilsService.getLoggerData({}, 'INFO',
    filename, 'getRootOrgs', 'getRootOrgs called', requestObj))
  contentProvider.getAllRootOrgs(requestObj, (err, res) => {
    if (!err && res && res.result.response.count > 0 && res.result.response.content) {
      cb(err, res)
    } else {
      LOG.error(utilsService.getLoggerData({}, 'ERROR',
        filename, 'getRootOrgs', 'error in getting root orgs.', err))
      process.exit(1)
    }
  })
}

/**
 * This method gets all channels through 'getRootOrgs' method response
 * data asynchronously and return back a promise
 * @returns promise
 */
function getAllChannelsFromAPI () {
  return new Promise(function (resolve, reject) {
    var limit = 200
    var offset = 0
    var allChannels = []
    var channelReqObj = {
      'request': {
        'filters': { 'isRootOrg': true },
        'offset': offset,
        'limit': limit
      }
    }
    LOG.info(utilsService.getLoggerData({}, 'INFO',
      filename, 'getAllChannelsFromAPI', 'fetching all channels req', channelReqObj))
    getRootOrgs(channelReqObj, function (err, res) {
      if (err) {
        reject(err)
      }
      const orgCount = res.result.response.count
      allChannels = _.without(_.map(res.result.response.content, 'hashTagId'), null)
      // if more orgs are there get them iteratively using async
      if (limit < orgCount) {
        var channelReqArr = []
        while ((offset + limit) < orgCount) {
          offset = offset + limit
          channelReqObj.request.offset = offset
          channelReqArr.push(_.cloneDeep(channelReqObj))
        }
        async.map(channelReqArr, getRootOrgs, function (err, mappedResArr) {
          if (err) {
            LOG.error(utilsService.getLoggerData({}, 'ERROR',
              filename, 'getFilterConfig', 'getAllChannelsFromAPI callback', err))
          }
          /**
           * extract hashTagId which represents the channelID from each response
           * of responseMap to generate the whitelisted channels array
           * */
          _.forEach(mappedResArr, function (item) {
            allChannels.push(_.map(item.result.response.content, 'hashTagId'))
          })
          allChannels = _.without(_.flatten(allChannels), null)
          LOG.info(utilsService.getLoggerData({}, 'INFO',
            filename, 'getAllChannelsFromAPI', 'all channels arr', allChannels))
          resolve(allChannels)
        })
      } else {
        LOG.info(utilsService.getLoggerData({}, 'INFO',
          filename, 'getAllChannelsFromAPI', 'all channels arr', allChannels))
        resolve(allChannels)
      }
    })
  })
}

module.exports = {
  getAllChannelsFromAPI: getAllChannelsFromAPI
}
