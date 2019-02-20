/**
 * @file  : frameworkCategoryInstanceService.js
 * @author: Rajath V B
 * @desc  : controller file for handle domain and concepts.
 */

var async = require('async')
var path = require('path')
var respUtil = require('response_util')
var ekStepUtil = require('sb_content_provider_util')
var LOG = require('sb_logger_util')

var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')

var filename = path.basename(__filename)
var responseCode = messageUtils.RESPONSE_CODE

/**
 * This function helps to get all domain from ekstep
 * @param {Object} req
 * @param {Object} response
 */

function getFrameworkCategoryInstance (req, response) {
  var data = {}
  var rspObj = req.rspObj
  data.body = req.body
  data.category = req.params.categoryID
  data.queryParams = req.query
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.category, 'category', '', {})
  }

  if (!data.queryParams) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkCategoryInstanceServiceAPI',
      'Error due to required params are missing', {
        category: data.category,
        qs: data.queryParams
      }))

    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkCategoryInstanceServiceAPI',
        'Request to ekstep for get course meta data', {
          qs: data.queryParams,
          category: data.category
        }))
      ekStepUtil.getFrameworkCategoryInstance(data.queryParams, data.category, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkCategoryInstanceServiceAPI',
            'Getting error from ekstep', res))
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      rspObj.result = res.result
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkCategoryInstanceServiceAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkCategoryInstanceSearch (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  data.queryParams = req.query
  if (!data) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkCategoryInstanceServiceAPI',
      'Error due to required params are missing', data))
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkCategoryInstanceServiceAPI',
        'Request to ekstep for search object type', {
          body: data,
          headers: req.headers,
          qs: data.queryParams
        }))
      ekStepUtil.frameworkCategoryInstanceSearch(ekStepReqData, data.queryParams, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkCategoryInstanceServiceAPI',
            'Getting error from ekstep', res))
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkCategoryInstanceServiceAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkCategoryInstanceCreate (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  data.queryParams = req.query
  if (!data) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkCategoryInstanceServiceAPI',
      'Error due to required params are missing', data))
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkCategoryInstanceServiceAPI',
        'Request to ekstep for search object type', {
          body: data,
          headers: req.headers,
          qs: data.queryParams
        }))
      ekStepUtil.frameworkCategoryInstanceCreate(ekStepReqData, data.queryParams, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkCategoryInstanceServiceAPI',
            'Getting error from ekstep', res))
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkCategoryInstanceServiceAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkCategoryInstanceUpdate (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  data.queryParams = req.query
  data.category = req.params.categoryID
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.category, 'category', '', {})
  }
  if (!data) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkCategoryInstanceServiceAPI',
      'Error due to required params are missing', data))
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkCategoryInstanceServiceAPI',
        'Request to ekstep for search object type', {
          body: data,
          headers: req.headers,
          category: data.category,
          qs: data.queryParams
        }))
      ekStepUtil.frameworkCategoryInstanceUpdate(ekStepReqData, data.queryParams, data.category, req.headers,
        function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkCategoryInstanceServiceAPI',
              'Getting error from ekstep', res))
            rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
            var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
            rspObj = utilsService.getErrorResponse(rspObj, res)
            return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
          } else {
            CBW(null, res)
          }
        })
    },

    function (res) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkCategoryInstanceServiceAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

module.exports.getFrameworkCategoryInstance = getFrameworkCategoryInstance
module.exports.frameworkCategoryInstanceSearch = frameworkCategoryInstanceSearch
module.exports.frameworkCategoryInstanceCreate = frameworkCategoryInstanceCreate
module.exports.frameworkCategoryInstanceUpdate = frameworkCategoryInstanceUpdate
