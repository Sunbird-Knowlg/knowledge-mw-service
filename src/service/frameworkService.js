/**
 * @file  : frameworkService.js
 * @author: Rajath V B
 * @desc  : controller file for handle domain and concepts.
 */

var async = require('async')
var path = require('path')
var _ = require('lodash')
var respUtil = require('response_util')
var ekStepUtil = require('sb_content_provider_util')
var logger = require('sb_logger_util_v2')
var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')

var filename = path.basename(__filename)
var responseCode = messageUtils.RESPONSE_CODE

/**
 * This function helps to get all domain from ekstep
 * @param {Object} req
 * @param {Object} response
 */

function getFrameworkById(req, response) {
  logger.debug({ msg: 'frameworkService.getFrameworkById() called' }, req)
  var data = {}
  var rspObj = req.rspObj
  data.body = req.body
  data.frameworkId = req.params.frameworkId
  var queryString = ''
  if (!_.isEmpty(req.query)) {
    queryString = '?'
    _.forEach(req.query, function (values, key) {
      queryString = queryString + key + '=' + values
    })
  }
  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.frameworkId, 'framework', '', {})
  }

  if (!data.frameworkId) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    logger.error({ msg: 'Error due to required framework Id is missing', additionalInfo: { data }, err: { responseCode: rspObj.responseCode } }, req)
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      logger.info({ msg: 'Request to fetch framework', additionalInfo: { frameworkId: _.get(data, 'frameworkId') } }, req)
      ekStepUtil.getFrameworkById(data.frameworkId, queryString, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          logger.error({ msg: 'Getting error from ekstep while fetching framework by id ', additionalInfo: { frameworkId: data.frameworkId, queryString }, err: { err, responseCode: rspObj.responseCode } }, req)
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj.result = res && res.result ? res.result : {}
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworklList(req, response) {
  logger.debug({ msg: 'frameworkService.frameworklList() called' }, req)
  var rspObj = req.rspObj
  var data = req.body
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    logger.error({ msg: 'Error due to required request body is missing', additionalInfo: { data }, err: { responseCode: rspObj.responseCode } }, req)
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      logger.info({ msg: 'request to get framework List' }, req)
      ekStepUtil.frameworklList(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          logger.error({ msg: 'Getting error from ekstep while fetching frameworkList', additionalInfo: { ekStepReqData }, err: { err, responseCode: rspObj.responseCode } }, req)
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj.result = res && res.result ? res.result : {}
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      rspObj.result = res.result
      logger.debug({ msg: 'framework List', additionalInfo: { result: rspObj.result } }, req)
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkCreate(req, response) {
  logger.debug({ msg: 'frameworkService.frameworkCreate() called' }, req)
  var rspObj = req.rspObj
  var data = req.body
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    logger.error({ msg: 'Error due to required request body is missing', additionalInfo: { data }, err: { responseCode: rspObj.responseCode } }, req)
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      logger.info({ msg: 'request for new framework creation' }, req)
      ekStepUtil.frameworkCreate(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          logger.error({ msg: 'Getting error from ekstep while framework creation', additionalInfo: { ekStepReqData }, err: { err, responseCode: rspObj.responseCode } }, req)
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj.result = res && res.result ? res.result : {}
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      rspObj.result = res.result
      logger.debug({ msg: 'framework created', additionalInfo: { result: rspObj.result } }, req)
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkUpdate(req, response) {
  logger.debug({ msg: 'frameworkService.frameworkUpdate() called' }, req)
  var rspObj = req.rspObj
  var data = req.body
  data.frameworkId = req.params.frameworkId
  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.frameworkId, 'framework', '', {})
  }
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    logger.error({ msg: 'Error due to required request body is missing', additionalInfo: { data }, err: { responseCode: rspObj.responseCode } }, req)
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      logger.info({ msg: 'request to update framework ', additionalInfo: { frameworkId: _.get(data, 'frameworkId') } }, req)
      ekStepUtil.frameworkUpdate(ekStepReqData, data.frameworkId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          logger.error({ msg: 'Getting error from ekstep while framework update', additionalInfo: { frameworkId: data.frameworkId, ekStepReqData }, err: { err, responseCode: rspObj.responseCode } }, req)
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj.result = res && res.result ? res.result : {}
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      rspObj.result = res.result
      logger.debug({ msg: 'framework updated', additionalInfo: { result: rspObj.result } }, req)
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkCopy(req, response) {
  logger.debug({ msg: 'frameworkService.frameworkCopy() called' }, req)
  var rspObj = req.rspObj
  var data = req.body
  data.frameworkId = req.params.frameworkId
  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.frameworkId, 'framework', '', {})
  }
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    logger.error({ msg: 'Error due to required request body is missing', additionalInfo: { data }, err: { responseCode: rspObj.responseCode } }, req)
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      logger.info({ msg: 'request to copy framework', additionalInfo: { frameworkId: _.get(data, 'frameworkId') } }, req)
      ekStepUtil.frameworkCopy(ekStepReqData, data.frameworkId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          logger.error({ msg: 'Getting error from ekstep while framework copy', additionalInfo: { frameworkId: data.frameworkId, ekStepReqData }, err: { err, responseCode: rspObj.responseCode } }, req)
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj.result = res && res.result ? res.result : {}
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      rspObj.result = res.result
      logger.debug({ msg: 'framework copied', additionalInfo: { result: rspObj.result } }, req)
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkPublish(req, response) {
  logger.debug({ msg: 'frameworkService.frameworkPublish() called' }, req)
  var rspObj = req.rspObj
  var data = req.body
  data.frameworkId = req.params.frameworkId
  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.frameworkId, 'framework', '', {})
  }
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    logger.error({ msg: 'Error due to required request body is missing', additionalInfo: { data }, err: { responseCode: rspObj.responseCode } }, req)
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      logger.info({ msg: 'request to publish framework', additionalInfo: { frameworkId: _.get(data, 'frameworkId') } }, req)
      ekStepUtil.frameworkPublish(ekStepReqData, data.frameworkId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          logger.error({ msg: 'Getting error from ekstep while framework publish', additionalInfo: { ekStepReqData, frameworkId: data.frameworkId }, err: { err, responseCode: rspObj.responseCode } }, req)
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj.result = res && res.result ? res.result : {}
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      rspObj.result = res.result
      logger.debug({ msg: 'framework published', additionalInfo: { result: rspObj.result } }, req)
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

module.exports.getFrameworkById = getFrameworkById
module.exports.frameworklList = frameworklList
module.exports.frameworkCreate = frameworkCreate
module.exports.frameworkUpdate = frameworkUpdate
module.exports.frameworkCopy = frameworkCopy
module.exports.frameworkPublish = frameworkPublish
