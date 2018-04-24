/**
 * @name : dialCodeService.js
 * @description :: Responsible for handle dial code service
 * @author      :: Anuj Gupta
 */

var async = require('async')
var path = require('path')
var _ = require('lodash')
var contentProvider = require('sb_content_provider_util')
var respUtil = require('response_util')
var LOG = require('sb_logger_util')
var configUtil = require('sb-config-util')

var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')
var ImageService = require('./dialCode/imageService')
var BatchImageService = require('./dialCode/batchImageService')
var dialCodeServiceHelper = require('./dialCode/dialCodeServiceHelper')

var filename = path.basename(__filename)
var dialCodeMessage = messageUtils.DIALCODE
var responseCode = messageUtils.RESPONSE_CODE

/**
 * This function helps to generate dialcode
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status
 */
function generateDialCodeAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!data.request || !data.request.dialcodes) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'generateDialCodeAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = dialCodeMessage.GENERATE.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.GENERATE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  if (!_.get(data, 'request.dialcodes.count') || !_.isSafeInteger(data.request.dialcodes.count)) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'generateDialCodeAPI',
      'Error due to error in count input', data.request))
    rspObj.errCode = dialCodeMessage.GENERATE.MISSING_COUNT
    rspObj.errMsg = dialCodeMessage.GENERATE.MISSING_COUNT_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Transform request for Content provider
  var reqData = {
    request: data.request
  }
  var requestedCount = _.clone(_.get(data, 'request.dialcodes.count'))
  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'generateDialCodeAPI',
        'Request to generate the dialcode', {
          body: reqData,
          headers: req.headers
        }))

      dialCodeServiceHelper.generateDialcodes(reqData, req.headers, function (err, res) {
        if (err || _.indexOf([responseCode.SUCCESS, responseCode.PARTIAL_SUCCESS], res.responseCode) === -1) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'generateDialCodeAPI', 'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.GENERATE.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.GENERATE.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    }, function (res, CBW) {
      var requestObj = data && data.request && data.request.dialcodes ? data.request.dialcodes : {}
      if (requestObj.qrCodeSpec && !_.isEmpty(requestObj.qrCodeSpec) && res.result.dialcodes &&
       res.result.dialcodes.length) {
        var batchImageService = new BatchImageService({
          width: requestObj.qrCodeSpec.width,
          height: requestObj.qrCodeSpec.height,
          border: requestObj.qrCodeSpec.border,
          text: requestObj.qrCodeSpec.text,
          errCorrectionLevel: requestObj.qrCodeSpec.errCorrectionLevel,
          color: requestObj.qrCodeSpec.color
        })
        var channel = _.clone(req.headers['x-channel-id'])
        batchImageService.createRequest(res.result.dialcodes, channel, requestObj.publisher, rspObj,
          function (err, processId) {
            if (err) {
              LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'generateDialCodeAPI',
                'Error while creating request to child process for images creation', err))
              res.responseCode = responseCode.PARTIAL_SUCCESS
              return response.status(207).send(respUtil.successResponse(res))
            } else {
              res.result.processId = processId
              CBW(null, res)
            }
          })
      } else {
        CBW(null, res)
      }
    },
    function (res) {
      rspObj.result = res.result
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'generateDialCodeAPI',
        'Return response back to user', rspObj))

      if (requestedCount > configUtil.getConfig('DIALCODE_GENERATE_MAX_COUNT')) {
        rspObj.responseCode = responseCode.PARTIAL_SUCCESS
        return response.status(207).send(respUtil.successResponse(rspObj))
      }
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to get list of dialcodes
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status
 */
function dialCodeListAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj
  var qrCodeFlag = !!(data && data.request && data.request.search && data.request.search.qrCodeSpec &&
     !_.isEmpty(data.request.search.qrCodeSpec))
  var qrCodeConfig = {}
  if (qrCodeFlag) {
    var requestObj = data.request.search
    qrCodeConfig = {
      width: _.clone(requestObj.qrCodeSpec.width),
      height: _.clone(requestObj.qrCodeSpec.height),
      border: _.clone(requestObj.qrCodeSpec.border),
      text: _.clone(requestObj.qrCodeSpec.text),
      errCorrectionLevel: _.clone(requestObj.qrCodeSpec.errCorrectionLevel),
      color: _.clone(requestObj.qrCodeSpec.color)
    }
  }

  if (!data.request || !data.request.search || !data.request.search.publisher) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'dialCodeListAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = dialCodeMessage.LIST.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.LIST.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  if (data.request && data.request.search) {
    data.request.search = _.omit(data.request.search, ['qrCodeSpec'])
  }
  // Transform request for Content provider
  var reqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'dialCodeListAPI',
        'Request to get list of dialcode', {
          body: reqData,
          headers: req.headers
        }))
      contentProvider.dialCodeList(reqData, req.headers, function (err, res) {
        if (err || _.indexOf([responseCode.SUCCESS, responseCode.PARTIAL_SUCCESS], res.responseCode) === -1) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'dialCodeListAPI', 'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.LIST.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.LIST.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    }, function (res, CBW) {
      if (qrCodeFlag && res.result.dialcodes && res.result.dialcodes.length) {
        var batchImageService = new BatchImageService(qrCodeConfig)
        var channel = _.clone(req.headers['x-channel-id'])
        var dialcodes = _.map(res.result.dialcodes, 'identifier')
        batchImageService.createRequest(dialcodes, channel, requestObj.publisher, rspObj, function (err, processId) {
          if (err) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'dialCodeListAPI',
              'Error while creating request to child process for images creation', err))
            res.responseCode = responseCode.PARTIAL_SUCCESS
            return response.status(207).send(respUtil.successResponse(res))
          } else {
            res.result.processId = processId
            CBW(null, res)
          }
        })
      } else {
        CBW(null, res)
      }
    },
    function (res) {
      rspObj.result = res.result
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'dialCodeListAPI',
        'Return response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to update dialcode
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status
 */
function updateDialCodeAPI (req, response) {
  var data = req.body
  data.dialCodeId = req.params.dialCodeId
  var rspObj = req.rspObj
  // Adding objectData in telemetryData object
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.dialCodeId, 'dialcode', '', {})
  }

  if (!data.request || !data.request.dialcode || !data.dialCodeId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateDialCodeAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = dialCodeMessage.UPDATE.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.UPDATE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Transform request for Ek step
  var reqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateDialCodeAPI',
        'Request to update the dialcode', {
          body: reqData,
          headers: req.headers
        }))
      contentProvider.updateDialCode(reqData, data.dialCodeId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateDialCodeAPI', 'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.UPDATE.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.UPDATE.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateDialCodeAPI',
        'Return response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to get dialcode meta
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status
 */
function getDialCodeAPI (req, response) {
  var data = {}
  data.body = req.body
  data.dialCodeId = _.get(req, 'body.request.dialcode.identifier')
  var rspObj = req.rspObj
  // Adding objectData in telemetryData object
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.dialCodeId, 'dialcode', '', {})
  }

  if (!data.dialCodeId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getDialCodeAPI',
      'Error due to required params are missing', {
        dialCodeId: data.dialCodeId
      }))
    rspObj.errCode = dialCodeMessage.GET.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.GET.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getDialCodeAPI',
        'Request to get dialcode meta data', {
          dialCodeId: data.dialCodeId,
          qs: data.queryParams,
          headers: req.headers
        }))
      contentProvider.getDialCode(data.dialCodeId, req.headers, function (err, res) {
        // After check response, we perform other operation
        console.log(err)
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getDialCodeAPI', 'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.GET.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.GET.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },
    function (res, CBW) {
      var qrCodeSpec = _.get(req, 'body.request.dialcode.qrCodeSpec')
      if (qrCodeSpec && !_.isEmpty(qrCodeSpec)) {
        var imgService = new ImageService(
          { width: qrCodeSpec.width,
            height: qrCodeSpec.height,
            border: qrCodeSpec.border,
            text: qrCodeSpec.text,
            errCorrectionLevel: qrCodeSpec.errCorrectionLevel,
            color: qrCodeSpec.color
          })
        var dialcode = res.result.dialcode.identifier
        var channel = res.result.dialcode.channel
        var publisher = res.result.dialcode.publisher
        imgService.getImage(dialcode, channel, publisher, undefined, undefined, true, function (err, image) {
          if (err) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getDialCodeAPI',
              'Generating image error', err))
            res.responseCode = responseCode.PARTIAL_SUCCESS
            return response.status(207).send(respUtil.successResponse(res))
          } else {
            res.result.dialcode.image = image.url
            CBW(null, res)
          }
        })
      } else {
        CBW(null, res)
      }
    },
    function (res) {
      rspObj.result = res.result
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getDialCodeAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to check content link api request data
 * @param {type} data
 * @returns {boolean} return response boolean value true or false
 */
function checkContentLinkRequest (data) {
  if (!data.request || !data.request.content || !data.request.content.identifier || !data.request.content.dialcode) {
    return false
  }
  var dialcodesLength = data.request.content.dialcode.length
  var identifiersLength = data.request.content.identifier.length
  if (dialcodesLength < 1 || identifiersLength < 1 || (dialcodesLength > 1 && identifiersLength > 1)) {
    return false
  } else {
    return true
  }
}

/**
 * This function helps to link the content with dialcode
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status
 */
function contentLinkDialCodeAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!checkContentLinkRequest(data)) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'contentLinkDialCodeAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = dialCodeMessage.CONTENT_LINK.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.CONTENT_LINK.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  // Transform request for content provider
  var reqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'contentLinkDialCodeAPI',
        'Request to link the content', {
          body: reqData,
          headers: req.headers
        }))
      contentProvider.contentLinkDialCode(reqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'contentLinkDialCodeAPI',
            'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.CONTENT_LINK.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.CONTENT_LINK.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'contentLinkDialCodeAPI',
        'Return response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function used to get the status of the batch dialcodes creation status with process id
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status
 */
function getProcessIdStatusAPI (req, response) {
  var data = {}
  data.body = req.body
  data.processId = req.params.processId
  var rspObj = req.rspObj
  // Adding objectData in telemetryData object
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.processId, 'dialcode', '', {})
  }

  if (!data.processId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getDialCodeAPI',
      'Error due to required params are missing', {
        processId: data.processId
      }))
    rspObj.errCode = dialCodeMessage.PROCESS.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.PROCESS.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  var batchImageService = new BatchImageService()
  batchImageService.getStatus(rspObj, req.params.processId).then(process => {
    return response.status(process.code).send(process.data)
  })
    .catch(err => {
      var error = JSON.parse(err.message)
      return response.status(error.code).send(error.data)
    })
}

/**
 * This function helps to search dialcode
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status
 */
function searchDialCodeAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!data.request || !data.request.search) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'searchDialCodeAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = dialCodeMessage.SEARCH.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.SEARCH.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Transform request for Content provider
  var reqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'searchDialCodeAPI', 'Request to search', {
        body: reqData,
        headers: req.headers
      }))
      contentProvider.searchDialCode(reqData, req.headers, function (err, res) {
        if (err || _.indexOf([responseCode.SUCCESS, responseCode.PARTIAL_SUCCESS], res.responseCode) === -1) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'searchDialCodeAPI', 'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.SEARCH.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.SEARCH.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'searchDialCodeAPI',
        'Return response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to publish dialcode
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status
 */
function publishDialCodeAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj
  data.dialCodeId = req.params.dialCodeId
  // Adding objectData in telemetryData object
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.dialCodeId, 'dialcode', '', {})
  }

  if (!data.request || !data.dialCodeId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'publishDialCodeAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = dialCodeMessage.PUBLISH.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.PUBLISH.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Transform request for Content provider
  var reqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'publishDialCodeAPI',
        'Request to publish the dialcode', {
          body: reqData,
          headers: req.headers
        }))
      contentProvider.publishDialCode(reqData, data.dialCodeId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'publishDialCodeAPI', 'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.PUBLISH.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.PUBLISH.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'publishDialCodeAPI',
        'Return response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to create publisher
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status
 */
function createPublisherAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!data.request || !data.request.publisher || !data.request.publisher.identifier || !data.request.publisher.name) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createPublisherAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = dialCodeMessage.CREATE_PUBLISHER.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.CREATE_PUBLISHER.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Transform request for Content provider
  var reqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createPublisherAPI',
        'Request to create publisher', {
          body: reqData,
          headers: req.headers
        }))
      contentProvider.createPublisher(reqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createPublisherAPI', 'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.CREATE_PUBLISHER.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.CREATE_PUBLISHER.FAILED_MESSAGE
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
      // Adding objectData in telemetryData object
      if (rspObj.telemetryData) {
        rspObj.telemetryData.object = utilsService.getObjectData(data.dialCodeId, 'dialcode', '', {})
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createPublisherAPI',
        'Return response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to update publisher
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status
 */
function updatePublisherAPI (req, response) {
  var data = req.body
  data.publisherId = req.params.publisherId
  var rspObj = req.rspObj

  if (!data.request || !data.request.publisher || !data.publisherId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updatePublisherAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = dialCodeMessage.UPDATE_PUBLISHER.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.UPDATE_PUBLISHER.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Transform request for Content Provider
  var reqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updatePublisherAPI',
        'Request to update the publisher', {
          body: reqData,
          headers: req.headers
        }))
      contentProvider.updatePublisher(reqData, data.publisherId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updatePublisherAPI', 'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.UPDATE_PUBLISHER.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.UPDATE_PUBLISHER.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updatePublisherAPI',
        'Return response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to get publisher metadata
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status
 */
function getPublisherAPI (req, response) {
  var data = {}
  data.publisherId = req.params.publisherId
  var rspObj = req.rspObj

  if (!data.publisherId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getPublisherAPI',
      'Error due to required params are missing', {
        dialCodeId: data.dialCodeId
      }))
    rspObj.errCode = dialCodeMessage.GET.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.GET.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getPublisherAPI',
        'Request to get publisher meta data', {
          publisherId: data.publisherId,
          qs: data.queryParams,
          headers: req.headers
        }))
      contentProvider.getPublisher(data.publisherId, req.headers, function (err, res) {
        // After check response, we perform other operation
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getPublisherAPI', 'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.GET.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.GET.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getPublisherAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

module.exports.generateDialCodeAPI = generateDialCodeAPI
module.exports.dialCodeListAPI = dialCodeListAPI
module.exports.updateDialCodeAPI = updateDialCodeAPI
module.exports.getDialCodeAPI = getDialCodeAPI
module.exports.contentLinkDialCodeAPI = contentLinkDialCodeAPI
module.exports.getProcessIdStatusAPI = getProcessIdStatusAPI
module.exports.searchDialCodeAPI = searchDialCodeAPI
module.exports.publishDialCodeAPI = publishDialCodeAPI
module.exports.createPublisherAPI = createPublisherAPI
module.exports.createPublisherAPI = createPublisherAPI
module.exports.getPublisherAPI = getPublisherAPI
module.exports.updatePublisherAPI = updatePublisherAPI
