/**
 * @file  : frameworkService.js
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

function getFrameworkById (req, response) {
  var data = {}
  var rspObj = req.rspObj
  data.body = req.body
  data.frameworkId = req.params.frameworkId
  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.frameworkId, 'framework', '', {})
  }

  if (!data.frameworkId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkServiceAPI',
      'Error due to required params are missing', {
        frameworkId: data.frameworkId
      }))

    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkServiceAPI',
        'Request to ekstep for get course meta data', {
          frameworkId: data.frameworkId
        }))
      ekStepUtil.getFrameworkById(data.frameworkId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkServiceAPI',
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkServiceAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworklList (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  if (!data) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkServiceAPI',
      'Error due to required params are missing', data))
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkServiceAPI',
        'Request to ekstep for search object type', {
          body: data,
          headers: req.headers
        }))
      ekStepUtil.frameworklList(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkServiceAPI',
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkServiceAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkCreate (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  if (!data) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkServiceAPI',
      'Error due to required params are missing', data))
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkServiceAPI',
        'Request to ekstep for search object type', {
          body: data,
          headers: req.headers
        }))
      ekStepUtil.frameworkCreate(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkServiceAPI',
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkServiceAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkUpdate (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  data.frameworkId = req.params.frameworkId
  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.frameworkId, 'framework', '', {})
  }
  if (!data) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkServiceAPI',
      'Error due to required params are missing', data))
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkServiceAPI',
        'Request to ekstep for search object type', {
          body: data,
          headers: req.headers,
          frameworkId: data.frameworkId
        }))
      ekStepUtil.frameworkUpdate(ekStepReqData, data.frameworkId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkServiceAPI',
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkServiceAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkCopy (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  data.frameworkId = req.params.frameworkId
  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.frameworkId, 'framework', '', {})
  }
  if (!data) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkServiceAPI',
      'Error due to required params are missing', data))
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkServiceAPI',
        'Request to ekstep for search object type', {
          body: data,
          headers: req.headers,
          frameworkId: data.frameworkId
        }))
      ekStepUtil.frameworkCopy(ekStepReqData, data.frameworkId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkServiceAPI',
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkServiceAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkPublish (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  data.frameworkId = req.params.frameworkId
  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.frameworkId, 'framework', '', {})
  }
  if (!data) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkServiceAPI',
      'Error due to required params are missing', data))
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkServiceAPI',
        'Request to ekstep for search object type', {
          body: data,
          headers: req.headers,
          frameworkId: data.frameworkId
        }))
      ekStepUtil.frameworkPublish(ekStepReqData, data.frameworkId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'frameworkServiceAPI',
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'frameworkServiceAPI',
        'Sending response back to user'))
      rspObj.result = res.result
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
