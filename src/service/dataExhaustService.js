/**
 * @file  : dataExhaustService.js
 * @author: Anuj Gupta
 * @desc  : controller file for handle data exhaust service.
 */

var async = require('async')
var path = require('path')
var respUtil = require('response_util')
var contentProvider = require('sb_content_provider_util')
var logger = require('sb_logger_util_v2')
var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')

var filename = path.basename(__filename)
var dataSetMessages = messageUtils.DATASET
var responseCode = messageUtils.RESPONSE_CODE

/**
 * This controller function helps to submit data set request
 * @param {object} req
 * @param {object} response
 */
function submitDataSetRequest(req, response) {
  var data = req.body
  var rspObj = req.rspObj

  async.waterfall([

    function (CBW) {
      logger.info({ msg: 'Request to content provider to submit data exhaust' }, req)
      contentProvider.submitDataSetRequest(data, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          logger.error({ msg: 'Getting error from content provider while submitting dataset request', err }, req)
          rspObj.result = res && res.result ? res.result : {}
          rspObj = utilsService.getErrorResponse(rspObj, res, dataSetMessages.SUBMIT)
          return response.status(utilsService.getHttpStatus(res)).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },
    function (res) {
      rspObj.result = res.result
      logger.info({ msg: 'submitDataSetRequest API result', additionalInfo: { result: rspObj.result } }, req)
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This constructor function helps to get list of data sets.
 * @param {object} req
 * @param {object} response
 */
function getListOfDataSetRequest(req, response) {
  var query = req.query
  var rspObj = req.rspObj
  var clientKey = req.params.clientKey

  async.waterfall([

    function (CBW) {
      logger.info({
        msg: 'Request to content provider to get list of dataset',
        additionalInfo: {
          query: query,
          clientKey: clientKey
        }
      }, req)

      contentProvider.getListOfDataSetRequest(query, clientKey, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          logger.error({ msg: 'Getting error from content provider while getting list of dataset', err }, req)
          rspObj.result = res && res.result ? res.result : {}
          rspObj = utilsService.getErrorResponse(rspObj, res, dataSetMessages.LIST)
          return response.status(utilsService.getHttpStatus(res)).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },
    function (res) {
      rspObj.result = res.result
      logger.info({ msg: 'getListOfDataSetRequest API result', additionalInfo: { result: rspObj.result } }, req)
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This constructor function helps to get detail of data set.
 * @param {object} req
 * @param {object} response
 */
function getDataSetDetailRequest(req, response) {
  var rspObj = req.rspObj
  var clientKey = req.params.clientKey
  var requestId = req.params.requestId

  async.waterfall([

    function (CBW) {
      logger.info({
        msg: 'Request to content provider to get detail of dataset',
        additionalInfo: {
          clientKey: clientKey,
          requestId: requestId
        }
      }, req)
      contentProvider.getDataSetDetailRequest(clientKey, requestId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          logger.error({ msg: 'Getting error from content provider while getting detail of dataset', err }, req)
          rspObj.result = res && res.result ? res.result : {}
          rspObj = utilsService.getErrorResponse(rspObj, res, dataSetMessages.READ)
          return response.status(utilsService.getHttpStatus(res)).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },
    function (res) {
      rspObj.result = res.result
      logger.info({ msg: 'getDataSetDetailRequest API result', additionalInfo: { result: rspObj.result } }, req)
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This constructor function helps to get channel data set.
 * @param {object} req
 * @param {object} response
 */
function getChannelDataSetRequest(req, response) {
  var query = req.query
  var rspObj = req.rspObj
  var dataSetId = req.params.dataSetId
  var channelId = req.params.channelId

  async.waterfall([

    function (CBW) {
      logger.info({
        msg: 'Request to content provider to get channel dataset',
        additionalInfo: {
          query: query,
          dataSetId: dataSetId,
          channelId: channelId
        }
      }, req)
      contentProvider.getChannelDataSetRequest(query, dataSetId, channelId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          logger.error({ msg: 'Getting error from content provider to get channel dataset', err }, req)
          rspObj.result = res && res.result ? res.result : {}
          rspObj = utilsService.getErrorResponse(rspObj, res, dataSetMessages.CHANNEL)
          return response.status(utilsService.getHttpStatus(res)).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },
    function (res) {
      rspObj.result = res.result
      logger.info({ msg: 'getChannelDataSetRequest API result', additionalInfo: { result: rspObj.result } }, req)
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

module.exports.submitDataSetRequest = submitDataSetRequest
module.exports.getListOfDataSetRequest = getListOfDataSetRequest
module.exports.getDataSetDetailRequest = getDataSetDetailRequest
module.exports.getChannelDataSetRequest = getChannelDataSetRequest
