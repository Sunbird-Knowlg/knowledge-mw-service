var path = require('path')
var filename = path.basename(__filename)
var utilsService = require('../service/utilsService')
var logger = require('sb_logger_util_v2')
var async = require('async')
var _ = require('lodash')
var orgDataHelper = require('./orgHelper')

/**
 * This method gets all channels through 'getRootOrgs' method response
 * data asynchronously and return back a promise
 * @returns promise
 */
function getAllChannelsFromAPI() {
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
    logger.debug({ msg: 'Request to get all channels from getAllChannelsFrom API', additionalInfo: { channelReqObj } })
    orgDataHelper.getRootOrgs(channelReqObj, function (err, res) {
      if (err) {
        logger.error({ msg: 'Error while getting root Org info', err, additionalInfo: { channelReqObj } })
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
        async.map(channelReqArr, orgDataHelper.getRootOrgs, function (err, mappedResArr) {
          if (err) {
            logger.error({msg: 'Error from getAllChannelsFrom API', err})
          }
          /**
           * extract hashTagId which represents the channelID from each response
           * of responseMap to generate the whitelisted channels array
           * */
          _.forEach(mappedResArr, function (item) {
            allChannels.push(_.map(item.result.response.content, 'hashTagId'))
          })
          allChannels = _.without(_.flatten(allChannels), null)
          logger.debug({ msg: 'All channels info from getAllChannelsFrom API', additionalInfo: { allChannels } })
          resolve(allChannels)
        })
      } else {
        logger.debug({ msg: 'All channels info from getAllChannelsFrom API', additionalInfo: { allChannels } })
        resolve(allChannels)
      }
    })
  })
}

module.exports = {
  getAllChannelsFromAPI: getAllChannelsFromAPI
}
