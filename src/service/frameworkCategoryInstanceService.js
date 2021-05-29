/**
 * @file  : frameworkCategoryInstanceService.js
 * @author: Rajath V B
 * @desc  : controller file for handle domain and concepts.
 */

var async = require('async')
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
    rspObj.responseCode = responseCode.CLIENT_ERROR
    utilsService.logErrorInfo('getFrameworkCategoryInstance',
      rspObj,
      'Error due to missing request body or query Parameters or categoryId')
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      utilsService.logDebugInfo('getFrameworkCategoryInstance', rspObj, 'Request to get Framework Category instance')
      ekStepUtil.getFrameworkCategoryInstance(data.queryParams, data.category, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          utilsService.logErrorInfo('getFrameworkCategoryInstance',
            rspObj,
            'Error while fetching framework category instance from ekstep')
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

function frameworkCategoryInstanceSearch (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  data.queryParams = req.query
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    utilsService.logErrorInfo('frameworkCategoryInstanceSearch',
      rspObj,
      'Error due to missing request body or query params')
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([
    function (CBW) {
      utilsService.logDebugInfo('frameworkCategoryInstanceSearch',
        rspObj,
        'Request to search Framework Category instance')
      ekStepUtil.frameworkCategoryInstanceSearch(ekStepReqData, data.queryParams, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          utilsService.logErrorInfo('frameworkCategoryInstanceSearch',
            rspObj,
            'Error while searching framework category instance from ekstep')
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
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function frameworkCategoryInstanceCreate (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  data.queryParams = req.query
  if (!data) {
    rspObj.responseCode = responseCode.CLIENT_ERROR
    utilsService.logErrorInfo('frameworkCategoryInstanceCreate',
      rspObj,
      'Error due to missing request body or query params')
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([
    function (CBW) {
      utilsService.logDebugInfo('frameworkCategoryInstanceCreate',
        rspObj,
        'Request to create Framework Category instance')
      ekStepUtil.frameworkCategoryInstanceCreate(ekStepReqData, data.queryParams, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          utilsService.logErrorInfo('frameworkCategoryInstanceCreate',
            rspObj,
            'Error while creating framework category instance from ekstep')
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
    rspObj.responseCode = responseCode.CLIENT_ERROR
    utilsService.logErrorInfo('frameworkCategoryInstanceUpdate',
      rspObj,
      'Error due to missing request body or query params or categoryId')
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([
    function (CBW) {
      utilsService.logDebugInfo('frameworkCategoryInstanceUpdate',
        rspObj,
        'Request to update Framework Category instance')
      ekStepUtil.frameworkCategoryInstanceUpdate(ekStepReqData, data.queryParams, data.category, req.headers,
        function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
            utilsService.logErrorInfo('frameworkCategoryInstanceUpdate',
              rspObj,
              'Error while updating framework category instance from ekstep')
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
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

module.exports.getFrameworkCategoryInstance = getFrameworkCategoryInstance
module.exports.frameworkCategoryInstanceSearch = frameworkCategoryInstanceSearch
module.exports.frameworkCategoryInstanceCreate = frameworkCategoryInstanceCreate
module.exports.frameworkCategoryInstanceUpdate = frameworkCategoryInstanceUpdate
