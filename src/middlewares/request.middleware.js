var async = require('async')
var uuidV1 = require('uuid/v1')
var respUtil = require('response_util')
var messageUtil = require('../service/messageUtil')
var LOG = require('sb_logger_util')
var utilsService = require('../service/utilsService')
var path = require('path')
var contentProvider = require('sb_content_provider_util')
var ApiInterceptor = require('sb_api_interceptor')
var _ = require('underscore')

var reqMsg = messageUtil.REQUEST
var responseCode = messageUtil.RESPONSE_CODE
var apiVersions = messageUtil.API_VERSION
var filename = path.basename(__filename)

var keyCloakConfig = {
  'authServerUrl': process.env.sunbird_keycloak_auth_server_url ? process.env.sunbird_keycloak_auth_server_url : 'https://staging.open-sunbird.org/auth',
  'realm': process.env.sunbird_keycloak_realm ? process.env.sunbird_keycloak_realm : 'sunbird',
  'clientId': process.env.sunbird_keycloak_client_id ? process.env.sunbird_keycloak_client_id : 'portal',
  'public': process.env.sunbird_keycloak_public ? process.env.sunbird_keycloak_public : true
}

var cacheConfig = {
  store: process.env.sunbird_cache_store ? process.env.sunbird_cache_store : 'memory',
  ttl: process.env.sunbird_cache_ttl ? process.env.sunbird_cache_ttl : 1800
}

var apiInterceptor = new ApiInterceptor(keyCloakConfig, cacheConfig)

/**
 * This function helps to validate the request body and create response body
 * this function works as a middleware which called before each api
 * @param {type} req
 * @param {type} res
 * @param {type} next
 * @returns {unresolved}
 */
function createAndValidateRequestBody (req, res, next) {
  req.body.ts = new Date()
  req.body.url = req.url
  req.body.path = req.route.path
  req.body.params = req.body.params ? req.body.params : {}
  req.body.params.msgid = req.headers['msgid'] || req.body.params.msgid || uuidV1()

  var rspObj = {
    apiId: utilsService.getAppIDForRESP(req.body.path),
    path: req.body.path,
    apiVersion: apiVersions.V1,
    msgid: req.body.params.msgid,
    result: {},
    startTime: new Date(),
    method: req.originalMethod
  }

  rspObj.telemetryData = {
    params: utilsService.getParamsDataForLogEvent(rspObj),
    context: utilsService.getTelemetryContextData(req),
    actor: utilsService.getTelemetryActorData(req)
  }
  req.headers.telemetryData = rspObj.telemetryData

  var removedHeaders = ['host', 'origin', 'accept', 'referer', 'content-length', 'user-agent', 'accept-encoding',
    'accept-language', 'accept-charset', 'cookie', 'dnt', 'postman-token', 'cache-control', 'connection']

  removedHeaders.forEach(function (e) {
    delete req.headers[e]
  })

  var requestedData = {body: req.body, params: req.body.params, headers: req.headers}
  LOG.info(utilsService.getLoggerData(rspObj, 'INFO',
    filename, 'createAndValidateRequestBody', 'API request come', requestedData))

  req.rspObj = rspObj
  next()
}

/**
 * [validateToken - Used to validate the token and add userid into headers]
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 */
function validateToken (req, res, next) {
  var token = req.headers['x-authenticated-user-token']
  var rspObj = req.rspObj

  if (!token) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'validateToken', 'API failed due to missing token'))
    rspObj.errCode = reqMsg.TOKEN.MISSING_CODE
    rspObj.errMsg = reqMsg.TOKEN.MISSING_MESSAGE
    rspObj.responseCode = responseCode.UNAUTHORIZED_ACCESS
    return res.status(401).send(respUtil.errorResponse(rspObj))
  }

  apiInterceptor.validateToken(token, function (err, tokenData) {
    if (err) {
      LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'validateToken', 'Invalid token', err))
      rspObj.errCode = reqMsg.TOKEN.INVALID_CODE
      rspObj.errMsg = reqMsg.TOKEN.INVALID_MESSAGE
      rspObj.responseCode = responseCode.UNAUTHORIZED_ACCESS
      return res.status(401).send(respUtil.errorResponse(rspObj))
    } else {
      delete req.headers['x-authenticated-userid']
      delete req.headers['x-authenticated-user-token']
      req.rspObj.userId = tokenData.userId
      rspObj.telemetryData.actor = utilsService.getTelemetryActorData(req)
      req.headers['x-authenticated-userid'] = tokenData.userId
      req.rspObj = rspObj
      next()
    }
  })
}

/**
 * [apiAccessForCreatorUser - Check api access for creator user]
 * @param  {[type]}   req
 * @param  {[type]}   response
 * @param  {Function} next
 */
function apiAccessForCreatorUser (req, response, next) {
  var userId = req.headers['x-authenticated-userid']
  var data = {}
  var rspObj = req.rspObj
  var qs = {
    fields: 'createdBy'
  }
  var contentMessage = messageUtil.CONTENT

  data.contentId = req.params.contentId

  async.waterfall([

    function (CBW) {
      contentProvider.getContentUsingQuery(data.contentId, qs, req.headers,
        function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename,
              'apiAccessForCreatorUser', 'Getting error from content provider', res))
            rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET.FAILED_CODE
            rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET.FAILED_MESSAGE
            rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
            var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
            return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
          } else {
            CBW(null, res)
          }
        })
    },
    function (res) {
      if (res.result.content.createdBy !== userId) {
        LOG.error(utilsService.getLoggerData(rspObj, 'ERROR',
          filename, 'apiAccessForCreatorUser', 'Content createdBy and userId not matched',
          {createBy: res.result.content.createdBy, userId: userId}))
        rspObj.errCode = reqMsg.TOKEN.INVALID_CODE
        rspObj.errMsg = reqMsg.TOKEN.INVALID_MESSAGE
        rspObj.responseCode = responseCode.UNAUTHORIZED_ACCESS
        return response.status(401).send(respUtil.errorResponse(rspObj))
      } else {
        next()
      }
    }
  ])
}

/**
 * [apiAccessForReviewerUser - check api access for reviewer user]
 * @param  {[type]}   req
 * @param  {[type]}   response
 * @param  {Function} next
 */
function apiAccessForReviewerUser (req, response, next) {
  var userId = req.headers['x-authenticated-userid']
  var data = {}
  var rspObj = req.rspObj
  var qs = {
    fields: 'createdBy'
  }
  var contentMessage = messageUtil.CONTENT

  data.contentId = req.params.contentId

  async.waterfall([

    function (CBW) {
      contentProvider.getContentUsingQuery(data.contentId, qs, req.headers,
        function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename,
              'apiAccessForReviewerUser', 'Getting error from content provider', res))
            rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET.FAILED_CODE
            rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET.FAILED_MESSAGE
            rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
            var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
            return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
          } else {
            CBW(null, res)
          }
        })
    },
    function (res) {
      if (res.result.content.createdBy === userId) {
        LOG.error(utilsService.getLoggerData(rspObj, 'ERROR',
          filename, 'apiAccessForReviewerUser', 'Content createdBy and userId are matched'))
        rspObj.errCode = reqMsg.TOKEN.INVALID_CODE
        rspObj.errMsg = reqMsg.TOKEN.INVALID_MESSAGE
        rspObj.responseCode = responseCode.UNAUTHORIZED_ACCESS
        return response.status(401).send(respUtil.errorResponse(rspObj))
      } else {
        next()
      }
    }
  ])
}

/**
 * [hierarchyUpdateApiAccess - Check api access for hierarchy update
 * @param  {[type]}   req
 * @param  {[type]}   response
 * @param  {Function} next
 */
function hierarchyUpdateApiAccess (req, response, next) {
  var userId = req.headers['x-authenticated-userid']
  var data = req.body
  var rspObj = req.rspObj
  var qs = {
    fields: 'createdBy'
  }
  var contentMessage = messageUtil.CONTENT

  if (!data.request || !data.request.data || !data.request.data.hierarchy) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'hierarchyUpdateApiAccess',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.HIERARCHY_UPDATE.MISSING_CODE
    rspObj.errMsg = contentMessage.HIERARCHY_UPDATE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var hierarchy = data.request.data.hierarchy
  data.contentId = _.findKey(hierarchy, function (item) {
    if (item.root === true) return item
  })

  async.waterfall([
    function (CBW) {
      contentProvider.getContentUsingQuery(data.contentId, qs, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename,
            'apiAccessForCreatorUser', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },
    function (res) {
      if (res.result.content.createdBy !== userId) {
        LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename,
          'apiAccessForCreatorUser', 'Content createdBy and userId not matched',
          {createBy: res.result.content.createdBy, userId: userId}))
        rspObj.errCode = reqMsg.TOKEN.INVALID_CODE
        rspObj.errMsg = reqMsg.TOKEN.INVALID_MESSAGE
        rspObj.responseCode = responseCode.UNAUTHORIZED_ACCESS
        return response.status(401).send(respUtil.errorResponse(rspObj))
      } else {
        next()
      }
    }
  ])
}

/**
 * [validateChannel - Used to check channel id in request headers.
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 */
function checkChannelID (req, res, next) {
  var channelID = req.headers['x-channel-id']
  var rspObj = req.rspObj

  if (!channelID) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'checkChannelID',
      'API failed due to missing channelID'))
    rspObj.errCode = reqMsg.PARAMS.MISSING_CHANNELID_CODE
    rspObj.errMsg = reqMsg.PARAMS.MISSING_CHANNELID_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return res.status(400).send(respUtil.errorResponse(rspObj))
  }
  next()
}

// Exports required function
module.exports.validateToken = validateToken
module.exports.createAndValidateRequestBody = createAndValidateRequestBody
module.exports.apiAccessForReviewerUser = apiAccessForReviewerUser
module.exports.apiAccessForCreatorUser = apiAccessForCreatorUser
module.exports.hierarchyUpdateApiAccess = hierarchyUpdateApiAccess
module.exports.checkChannelID = checkChannelID
