/**
 * @file  : channelService.js
 * @author: Rajath V B
 * @desc  : controller file for handle domain and concepts.
 */

var async = require('async')
var respUtil = require('response_util')
var ekStepUtil = require('sb_content_provider_util')
var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')
var _ = require('lodash')
var responseCode = messageUtils.RESPONSE_CODE

/**
 * This function helps to get all domain from ekstep
 * @param {Object} req
 * @param {Object} response
 */

function getChannelValuesById (req, response) {
  var data = {}
  var rspObj = req.rspObj
  utilsService.logDebugInfo('channelRead',
    rspObj,
    'channelService.getChannelValuesById() called')
  data.body = req.body
  data.channelId = req.params.channelId
  let objectInfo = {'id': _.get(data, 'channelId'), 'type': 'Channel'}
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.channelId, 'channel', '', {})
  }

  if (!data.channelId) {
    rspObj.responseCode = responseCode
    utilsService.logErrorInfo('channelRead',
      rspObj,
      'Error due to required channel Id is missing',
      objectInfo)
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      utilsService.logDebugInfo('channelRead',
        rspObj,
        'Request to get channel details by id')
      ekStepUtil.getChannelValuesById(data.channelId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          rspObj.errMsg = 'Getting error from ekstep while fetching channel by id'
          utilsService.logErrorInfo('channelRead',
            rspObj,
            err,
            objectInfo)
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
      utilsService.logDebugInfo('channelRead',
        rspObj,
        'channel details')
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function ChannelCreate (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  utilsService.logDebugInfo('channelCreate',
    rspObj,
    'channelService.ChannelCreate() called')
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    utilsService.logErrorInfo('channelCreate',
      rspObj,
      'Error due to required request body is missing')
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      utilsService.logDebugInfo('channelCreate',
        rspObj,
        'Request to create channel')
      ekStepUtil.ChannelCreate(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          rspObj.errMsg = 'Getting error from ekstep while creating channel'
          utilsService.logErrorInfo('channelCreate',
            rspObj,
            err)
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
      utilsService.logDebugInfo('channelCreate',
        rspObj,
        'channel created')
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function ChannelUpdate (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  utilsService.logDebugInfo('channelUpdate',
    rspObj,
    'channelService.ChannelUpdate() called')
  data.channelId = req.params.channelId
  let objectInfo = {'id': _.get(req, 'params.channelId'), 'type': 'Channel'}

  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.channelId, 'channel', '', {})
  }
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    utilsService.logErrorInfo('channelCreate',
      rspObj,
      'Error due to required request body is missing',
      objectInfo)
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      utilsService.logDebugInfo('channelUpdate',
        rspObj,
        'request to update channel')
      ekStepUtil.ChannelUpdate(ekStepReqData, data.channelId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          rspObj.errMsg = 'Getting error from ekstep while updating channel'
          utilsService.logErrorInfo('channelUpdate',
            rspObj,
            err,
            objectInfo)
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
      utilsService.logDebugInfo('channelUpdate',
        rspObj,
        'channel updated')
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

module.exports.getChannelValuesById = getChannelValuesById
module.exports.ChannelCreate = ChannelCreate
module.exports.ChannelUpdate = ChannelUpdate
