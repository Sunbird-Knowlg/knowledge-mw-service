var path = require('path')
var filename = path.basename(__filename)
var utilsService = require('../service/utilsService')
var logger = require('sb_logger_util_v2')
const contentProvider = require('sb_content_provider_util')
var _ = require('lodash')
var CacheManager = require('sb_cache_manager')
var cacheManager = new CacheManager({})
var configData = require('../config/constants')
var async = require('async')

/**
 * This function executes the org search lms API to get all orgs
 * @param requestObj  js object which contains the search request with filters,offset,limit,query etc
 * @param cb callback after success or error
 */
function getRootOrgs(requestObj, cb, noExitOnError) {
  logger.info({ msg: 'getRootOrgs() called', additionalInfo: { requestObj } })
  contentProvider.getAllRootOrgs(requestObj, (err, res) => {
    if (!err) {
      return cb(err, res)
    } else {
      logger.error({
        msg: 'Error from content provider while getting all root orgs details',
        err,
        additionalInfo: { requestObj }
      })
      if (!noExitOnError) {
        logger.fatal({
          msg: 'Exiting due to error from content provider while getting all root orgs details',
          err,
          additionalInfo: { requestObj, noExitOnError }
        })
        process.exit(1)
      }
    }
  })
}

/**
 * This function tries to get the orgdetails from cache if not exits fetches from api and sets to cache
 * @param requestObj is filter query that is sent to fetch org api call, tryfromcache is a boolean flag,
   inputdata is array of contents that needs org data
 * @param CBW callback after success or error
 */
function getRootOrgsFromCache(orgfetchquery, tryfromcache, inputdata, cb) {
  async.waterfall([
    function (CBW) {
      if (tryfromcache) {
        var keyNames = getKeyNames(inputdata)
        cacheManager.mget(keyNames, function (err, cacheresponse) {
          var cachedata = _.compact(cacheresponse)
          if (!err && _.size(cachedata) > 0) {
            return cb(null, cachedata)
          } else {
            if (err) {
              logger.error({ msg: 'getRootOrgsFromCache failed', err })
            }
            CBW()
          }
        })
      } else {
        CBW()
      }
    },
    function (CBW) {
      getRootOrgs(orgfetchquery, function (err, res) {
        if (err) {
          logger.error({ msg: 'Error while fetching rootOrgs', err, additionalInfo: { orgfetchquery } })
          return cb(err)
        } else {
          if (_.get(res, 'result.response') && _.get(res.result, 'response.content')) {
            var cacheinputdata = prepareCacheDataToInsert(res.result.response.content)
            insertDataToCache(cacheinputdata)
            return cb(null, res.result.response.content)
          } else {
            return cb(null, [])
          }
        }
      }, true)
    }
  ])
}

function insertDataToCache(cacheinputdata) {
  cacheManager.mset({ data: cacheinputdata, ttl: configData.orgCacheExpiryTime }, function (err, data) {
    if (err) {
      logger.error({ msg: 'Caching allRootOrgs data failed', err, additionalInfo: { data: cacheinputdata } })
    } else {
      logger.info({ msg: 'Caching allRootOrgs data successful', additionalInfo: { data: cacheinputdata } })
    }
  })
}

/**
 * This function loops each object from the input and maps channel id with hasTagId from orgdetails and prepares orgDetails obj for each obj in the array
 * @param inputdata is array of objects, it might be content or course
 * @param cb callback after success or error
 */
function populateOrgDetailsByHasTag(contents, inputfields, cb) {
  var orgDetails = []
  var orgFetchQuery = {
    'request': {
      'filters': { 'isRootOrg': true }
    }
  }
  var tryFromCache = true
  async.waterfall([
    // intially fetch all the orgs till the default limit
    function (CBW) {
      getRootOrgsFromCache(orgFetchQuery, tryFromCache, contents, function (err, orgdata) {
        if (!err && orgdata) {
          orgDetails = orgdata
          return CBW()
        } else {
          logger.error({
            msg: 'Error while getting rootOrgs from cache memory',
            err,
            additionalInfo: { orgFetchQuery, tryFromCache, contents }
          })
          return cb(null, contents)
        }
      })
    },
    // fetch the orgs which are not fetched from initial api call
    function (CBW) {
      var inputHashTagIds = _.uniq(_.map(contents, 'channel'))
      var fetchedhashTagIds = _.uniq(_.map(orgDetails, 'hashTagId'))
      // diff of channels which doesnt exists in inital fetch
      var hasTagIdsNeedToFetch = _.difference(inputHashTagIds, fetchedhashTagIds)
      orgFetchQuery.request.filters.hashTagId = hasTagIdsNeedToFetch
      if (hasTagIdsNeedToFetch.length) {
        // fetch directly from api , as hashTagIdsNeedToFetch are the data which are not found from first api query
        tryFromCache = false
        getRootOrgsFromCache(orgFetchQuery, tryFromCache, contents, function (err, orgdata) {
          if (!err && orgdata) {
            orgDetails = _.concat(orgDetails, orgdata)
            return CBW()
          } else {
            logger.error({
              msg: 'Error while getting rootOrgs from cache memory',
              err,
              additionalInfo: { orgFetchQuery, tryFromCache, contents }
            })
            return cb(null, contents)
          }
        })
      } else {
        CBW()
      }
    },
    // mapping channel with orgdetails in contents
    function (CBW) {
      var orgDetailsWithKey = _.keyBy(orgDetails, 'hashTagId')
      _.forEach(contents, (eachcontent, index) => {
        if (eachcontent.channel) {
          var eachorgdetail = orgDetailsWithKey[eachcontent.channel]
          contents[index].orgDetails = eachorgdetail ? _.pick(eachorgdetail, inputfields) : {}
        }
      })
      return cb(null, contents)
    }
  ])
}

/**
 * This function loops each object from the input and includes org details in it
 * @param inputdata is req object and res object
 * @param cb there will be no error callback , always returns success
 */
function includeOrgDetails(req, res, cb) {
  if (_.get(req, 'query.orgdetails') && _.get(res, 'result.content')) {
    var inputfields = req.query.orgdetails.split(',')
    var fieldsToPopulate = configData.orgfieldsAllowedToSend.filter(eachfield => inputfields.includes(eachfield))
    var inputContentIsArray = _.isArray(res.result.content)
    // contents need to send as array bec populateOrgDetailsByHasTag expects data as array
    var contents = inputContentIsArray ? res.result.content : [res.result.content]
    if (_.size(fieldsToPopulate) && _.size(contents)) {
      populateOrgDetailsByHasTag(contents, fieldsToPopulate, function
        (err, contentwithorgdetails) {
        if (!err) {
          res.result.content = inputContentIsArray ? contentwithorgdetails : contentwithorgdetails[0]
        }
        return cb(null, res)
      })
    } else {
      return cb(null, res)
    }
  } else {
    return cb(null, res)
  }
}

// prepares the set data for inserting in cache
function prepareCacheDataToInsert(data) {
  var cacheKeyValuePairs = []
  _.forEach(data, function (eachdata) {
    if (eachdata.hashTagId) {
      var keyname = configData.orgCacheKeyNamePrefix + eachdata.hashTagId
      cacheKeyValuePairs.push(keyname)
      cacheKeyValuePairs.push(eachdata)
    }
  })
  return cacheKeyValuePairs
}

// prepares the get data for fetching from cache
function getKeyNames(data) {
  var keyNames = []
  _.forEach(data, function (eachdata) {
    if (eachdata.channel) {
      var keyname = configData.orgCacheKeyNamePrefix + eachdata.channel
      keyNames.push(keyname)
    }
  })
  return _.uniq(keyNames)
}

module.exports = {
  getRootOrgs: getRootOrgs,
  includeOrgDetails: includeOrgDetails,
  populateOrgDetailsByHasTag: populateOrgDetailsByHasTag
}
