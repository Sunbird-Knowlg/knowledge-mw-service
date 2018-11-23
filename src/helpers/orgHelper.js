var path = require('path')
var filename = path.basename(__filename)
var utilsService = require('../service/utilsService')
var LOG = require('sb_logger_util')
const contentProvider = require('sb_content_provider_util')
var _ = require('lodash')
var CacheManager = require('sb_cache_manager')
var cacheManager = new CacheManager({})
var configData = require('../config/constants')

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
 * This function tries to get the orgdetails from cache if not exits fetches from api and sets to cache
 * @param requestObj is not needed bec all rootorgdetails are fetched here
 * @param CBW callback after success or error
 */
function getRootOrgsFromCache (CBW) {
  cacheManager.get(configData.orgCacheKeyName, function (err, cachedata) {
    if (err || !cachedata) {
      var inputObj = {
        'request': {
          'filters': { 'isRootOrg': true }
        }
      }
      getRootOrgs(inputObj, function (err, res) {
        if (err) {
          CBW(err)
        } else {
          var cacheinputdata = {
            key: configData.orgCacheKeyName,
            value: res.result.response.content,
            ttl: configData.orgCacheExpiryTime
          }
          cacheManager.set(cacheinputdata, function (err, data) {
            if (err) {
              LOG.error(utilsService.getLoggerData({}, 'ERROR', filename, 'Setting allRootOrgs cache failed',
                'Setting allRootOrgs cache data failed', err))
            } else {
              LOG.info(utilsService.getLoggerData({}, 'INFO', filename,
                'Setting allRootOrgs cache data success'))
            }
          })
          CBW(null, res.result.response.content)
        }
      })
    } else {
      CBW(null, cachedata)
    }
  })
}

/**
 * This function loops each object from the input and maps channel id with hasTagId from orgdetails and prepares orgDetails obj for each obj in the array
 * @param inputdata is array of objects, it might be content or course
 * @param cb callback after success or error
 */
function populateOrgDetailsByHasTag (inputdata, inputfields, cb) {
  inputfields = inputfields.split(',')
  var fieldsToPopulate = configData.orgfieldsAllowedToSend.filter(eachfield => inputfields.includes(eachfield))
  if (_.size(fieldsToPopulate) > 0 && _.size(inputdata) > 0) {
    getRootOrgsFromCache(function (err, orgdata) {
      if (!err && orgdata) {
        var orgDetails = _.keyBy(orgdata, 'hashTagId')
        _.forEach(inputdata, (eachcontent, index) => {
          if (eachcontent.channel) {
            var eachorgdetail = orgDetails[eachcontent.channel]
            inputdata[index].orgDetails = eachorgdetail ? _.pick(eachorgdetail, fieldsToPopulate) : {}
          }
        })
      };
      cb(null, inputdata)
    })
  } else {
    cb(null, inputdata)
  }
}

/**
 * This function loops each object from the input and includes org details in it
 * @param inputdata is req object and res object
 * @param cb there will be no error callback , always returns success
 */
function includeOrgDetails (req, res, cb) {
  if (_.get(req, 'query.orgdetails') && _.get(res, 'result.content')) {
    var fields = req.query.orgdetails
    var inputContentIsArray = _.isArray(res.result.content)
    // res.result.content need to send as array bec populateOrgDetailsByHasTag expects data as array
    res.result.content = inputContentIsArray ? res.result.content : [res.result.content]
    populateOrgDetailsByHasTag(res.result.content, fields, function
      (err, contentwithorgdetails) {
      if (!err) {
        res.result.content = inputContentIsArray ? contentwithorgdetails : contentwithorgdetails[0]
      }
      cb(null, res)
    })
  } else {
    cb(null, res)
  }
}

module.exports = {
  getRootOrgs: getRootOrgs,
  includeOrgDetails: includeOrgDetails,
  populateOrgDetailsByHasTag: populateOrgDetailsByHasTag
}
