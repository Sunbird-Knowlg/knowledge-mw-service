/**
 * @file  : frameworkService.js
 * @author: Rajath V B
 * @desc  : controller file for handle domain and concepts.
 */

var async = require('async')
var _ = require('lodash')
var respUtil = require('response_util')
var ekStepUtil = require('sb_content_provider_util')
var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')

var responseCode = messageUtils.RESPONSE_CODE

/**
 * This function helps to get all domain from ekstep
 * @param {Object} req
 * @param {Object} response
 */

function getFrameworkById (req, response) {
  utilsService.logDebugInfo('framework-read', req.rspObj, 'frameworkService.getFrameworkById() called')
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
    utilsService.logErrorInfo('framework-read', rspObj, 'Error due to required framework Id is missing')
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      const objectInfo = {id: _.get(data, 'frameworkId'), 'type': 'Framework'}
      utilsService.logDebugInfo('framework-read', rspObj, 'Request to fetch framework', objectInfo)
      ekStepUtil.getFrameworkById(data.frameworkId, queryString, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          const errorMessage = 'Getting error from ekstep while fetching framework by id'
          utilsService.logErrorInfo('framework-read', rspObj, errorMessage, objectInfo)
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

function frameworklList (req, response) {
  utilsService.logDebugInfo('framework-list', req.rspObj, 'frameworkService.frameworklList() called')
  var rspObj = req.rspObj
  var data = req.body
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    utilsService.logErrorInfo('framework-list', rspObj, 'Error due to required request body is missing')
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      utilsService.logDebugInfo('framework-list', rspObj, 'request to get framework List')
      ekStepUtil.frameworklList(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          utilsService.logErrorInfo('framework-list', rspObj, 'Getting error from ekstep while fetching frameworkList')
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
      utilsService.logDebugInfo('framework-list', rspObj, 'framework List')
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkCreate (req, response) {
  utilsService.logDebugInfo('framework-create', req.rspObj, 'frameworkService.frameworkCreate() called')
  var rspObj = req.rspObj
  var data = req.body
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    utilsService.logErrorInfo('framework-create', rspObj, 'Error due to required request body is missing')
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      utilsService.logDebugInfo('framework-create', rspObj, 'request for new framework creation')
      ekStepUtil.frameworkCreate(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          utilsService.logErrorInfo('framework-create', rspObj, 'Getting error from ekstep while framework creation')
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
      utilsService.logDebugInfo('framework-create', rspObj, 'framework created')
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkUpdate (req, response) {
  utilsService.logDebugInfo('framework-update', req.rspObj, 'frameworkService.frameworkUpdate() called')
  var rspObj = req.rspObj
  var data = req.body
  data.frameworkId = req.params.frameworkId
  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.frameworkId, 'framework', '', {})
  }
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    utilsService.logErrorInfo('framework-update', rspObj, 'Error due to required request body is missing')
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      const objectInfo = {id: _.get(data, 'frameworkId'), 'type': 'Framework'}
      utilsService.logDebugInfo('framework-update', rspObj, 'request to update framework', objectInfo)
      ekStepUtil.frameworkUpdate(ekStepReqData, data.frameworkId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          const errorMessage = 'Getting error from ekstep while framework update'
          utilsService.logErrorInfo('framework-update', rspObj, errorMessage, objectInfo)
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
      const objectInfo = {id: _.get(data, 'frameworkId'), 'type': 'Framework'}
      rspObj.result = res.result
      utilsService.logDebugInfo('framework-update', rspObj, 'framework updated', objectInfo)
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkCopy (req, response) {
  utilsService.logDebugInfo('framework-copy', req.rspObj, 'frameworkService.frameworkCopy() called')
  var rspObj = req.rspObj
  var data = req.body
  data.frameworkId = req.params.frameworkId
  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.frameworkId, 'framework', '', {})
  }
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    utilsService.logErrorInfo('framework-copy', rspObj, 'Error due to required request body is missing')
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      const objectInfo = {id: _.get(data, 'frameworkId'), 'type': 'Framework'}
      utilsService.logDebugInfo('framework-copy', rspObj, 'request to copy framework', objectInfo)
      ekStepUtil.frameworkCopy(ekStepReqData, data.frameworkId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          const errorMessage = 'Getting error from ekstep while framework copy'
          utilsService.logErrorInfo('framework-copy', rspObj, errorMessage, objectInfo)
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
      const objectInfo = {id: _.get(data, 'frameworkId'), 'type': 'Framework'}
      utilsService.logDebugInfo('framework-copy', rspObj, 'framework copied', objectInfo)
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkPublish (req, response) {
  utilsService.logDebugInfo('framework-publish', req.rspObj, 'frameworkService.frameworkPublish() called')
  var rspObj = req.rspObj
  var data = req.body
  data.frameworkId = req.params.frameworkId
  // Adding telemetry object data
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.frameworkId, 'framework', '', {})
  }
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    utilsService.logErrorInfo('framework-publish', rspObj, 'Error due to required request body is missing')
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      const objectInfo = {id: _.get(data, 'frameworkId'), 'type': 'Framework'}
      utilsService.logDebugInfo('framework-publish', rspObj, 'request to publish framework', objectInfo)
      ekStepUtil.frameworkPublish(ekStepReqData, data.frameworkId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          const errorMessage = 'Getting error from ekstep while framework publish'
          utilsService.logErrorInfo('framework-publish', rspObj, errorMessage, objectInfo)
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
      const objectInfo = {id: _.get(data, 'frameworkId'), 'type': 'Framework'}
      utilsService.logDebugInfo('framework-publish', rspObj, 'framework published', objectInfo)
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
