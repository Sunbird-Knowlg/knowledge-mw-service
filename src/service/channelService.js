/**
 * @file  : channelService.js
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

function getChannelValuesById (req, response) {
  var data = {}
  var rspObj = req.rspObj
  data.body = req.body
  data.channelId = req.params.channelId
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.channelId, 'channel', '', {})
  }

  if (!data.channelId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'channelServiceAPI',
      'Error due to required params are missing', {
        channelId: data.channelId
      }))

    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'channelServiceAPI',
        'Request to ekstep for get course meta data', {
          channelId: data.channelId
        }))
      ekStepUtil.getChannelValuesById(data.channelId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'channelServiceAPI',
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'channelServiceAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function ChannelList (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  if (!data) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'channelServiceAPI',
      'Error due to required params are missing', data))
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'channelServiceAPI',
        'Request to ekstep for search object type', {
          body: data,
          headers: req.headers
        }))
      ekStepUtil.ChannelList(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'channelServiceAPI',
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'channelServiceAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function ChannelSearch (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  if (!data) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'channelServiceAPI',
      'Error due to required params are missing', data))
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'channelServiceAPI',
        'Request to ekstep for search object type', {
          body: data,
          headers: req.headers
        }))
      ekStepUtil.ChannelSearch(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'channelServiceAPI',
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'channelServiceAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function ChannelCreate (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  if (!data) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'channelServiceAPI',
      'Error due to required params are missing', data))
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'channelServiceAPI',
        'Request to ekstep for search object type', {
          body: data,
          headers: req.headers
        }))
      ekStepUtil.ChannelCreate(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'channelServiceAPI',
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'channelServiceAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function ChannelUpdate (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  data.channelId = req.params.channelId
  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.channelId, 'channel', '', {})
  }
  if (!data) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'channelServiceAPI',
      'Error due to required params are missing', data))
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'channelServiceAPI',
        'Request to ekstep for search object type', {
          body: data,
          headers: req.headers,
          channelId: data.channelId
        }))
      ekStepUtil.ChannelUpdate(ekStepReqData, data.channelId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'channelServiceAPI',
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'channelServiceAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

module.exports.getChannelValuesById = getChannelValuesById
module.exports.ChannelList = ChannelList
module.exports.ChannelCreate = ChannelCreate
module.exports.ChannelUpdate = ChannelUpdate
module.exports.ChannelSearch = ChannelSearch
