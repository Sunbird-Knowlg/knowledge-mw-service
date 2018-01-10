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

var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')
var ImageService = require('./../service/dialCode/imageService')
var BatchImageService = require('./../service/dialCode/batchImageService')

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
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'generateDialCodeAPI', 'Error due to required params are missing', data.request))
    rspObj.errCode = dialCodeMessage.GENERATE.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.GENERATE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

    // Transform request for Ek step
  var reqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'generateDialCodeAPI', 'Request for create the content', {
        body: reqData,
        headers: req.headers
      }))
      contentProvider.generateDialCode(reqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'generateDialCodeAPI', 'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.GENERATE.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.GENERATE.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    }, function (res, CBW) {
      var requestObj = data && data.request && data.request.dialcodes ? data.request.dialcodes : {}
      if (requestObj.image && requestObj.image === true && res.result.dialcodes && res.result.dialcodes.length) {
        var batchImageService = new BatchImageService({ width: req.query.width,
          height: requestObj.height,
          border: requestObj.border,
          text: requestObj.text,
          quality: requestObj.quality,
          color: requestObj.color
        })
        var channel = _.clone(req.headers['x-channel-id'])
        batchImageService.createRequest(res.result.dialcodes, channel, requestObj.publisher, function (err, processId) {
          if (err) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'generateDialCodeAPI', 'Error while creating request to child process for images creation', err))
            rspObj.errCode = dialCodeMessage.GENERATE.FAILED_CODE
            rspObj.errMsg = dialCodeMessage.GENERATE.FAILED_MESSAGE
            rspObj.responseCode = responseCode.SERVER_ERROR
            return response.status(500).send(respUtil.errorResponse(rspObj))
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'generateDialCodeAPI', 'Return response back to user', rspObj))
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
  var imageFlag = !!(data && data.request && data.request.search && data.request.search.image)
  var imageConfig = {}
  if (imageFlag) {
    var requestObj = data && data.request && data.request.search ? data.request.search : {}
    imageConfig = { width: req.query.width,
      height: _.clone(requestObj.height),
      border: _.clone(requestObj.border),
      text: _.clone(requestObj.text),
      quality: _.clone(requestObj.quality),
      color: _.clone(requestObj.color)
    }
  }

  if (!data.request || !data.request.search) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'dialCodeListAPI', 'Error due to required params are missing', data.request))
    rspObj.errCode = dialCodeMessage.LIST.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.LIST.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  if (data.request && data.request.search) {
    data.request.search = _.omit(data.request.search, ['image', 'height', 'border', 'quality', 'color'])
  }
    // Transform request for Ek step
  var reqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'dialCodeListAPI', 'Request for create the content', {
        body: reqData,
        headers: req.headers
      }))
      contentProvider.dialCodeList(reqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'dialCodeListAPI', 'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.LIST.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.LIST.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    }, function (res, CBW) {
      if (imageFlag) {
        var batchImageService = new BatchImageService(imageConfig)
        var channel = _.clone(req.headers['x-channel-id'])
        var dialcodes = _.map(res.result.dialcodes, 'identifier')
        batchImageService.createRequest(dialcodes, channel, requestObj.publisher, function (err, processId) {
          if (err) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'dialCodeListAPI', 'Error while creating request to child process for images creation', err))
            rspObj.errCode = dialCodeMessage.GENERATE.FAILED_CODE
            rspObj.errMsg = dialCodeMessage.GENERATE.FAILED_MESSAGE
            rspObj.responseCode = responseCode.SERVER_ERROR
            return response.status(500).send(respUtil.errorResponse(rspObj))
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'dialCodeListAPI', 'Return response back to user'))
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

  if (!data.request || !data.request.dialcode || !data.dialCodeId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateDialCodeAPI', 'Error due to required params are missing', data.request))
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateDialCodeAPI', 'Request for update the content', {
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
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },
    function (res) {
      rspObj.result = res.result
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateDialCodeAPI', 'Return response back to user', rspObj))
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
  data.dialCodeId = req.params.dialCodeId
  var rspObj = req.rspObj

  if (!data.dialCodeId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getDialCodeAPI', 'Error due to required params are missing', {
      dialCodeId: data.dialCodeId
    }))
    rspObj.errCode = dialCodeMessage.GET.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.GET.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getDialCodeAPI', 'Request for get dialcode meta data', {
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
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },
    function (res, CBW) {
      if (req.query && req.query.image === 'true') {
        var imgService = new ImageService(
          { width: req.query.width,
            height: req.query.height,
            border: req.query.border,
            text: req.query.text,
            quality: req.query.quality,
            color: req.query.color
          })
        var dialcode = res.result.dialcode.identifier
        var channel = res.result.dialcode.channel
        var publisher = res.result.dialcode.publisher
        imgService.getImage(dialcode, channel, publisher, undefined, undefined, true, function (err, image) {
          if (err) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getDialCodeAPI', 'Generating image error', err))
            rspObj.errCode = dialCodeMessage.GET.FAILED_CODE
            rspObj.errMsg = dialCodeMessage.GET.FAILED_MESSAGE
            rspObj.responseCode = responseCode.SERVER_ERROR
            return response.status(500).send(respUtil.errorResponse(rspObj))
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getDialCodeAPI', 'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to link the content with dialcode
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status
 */
function contentLinkDialCodeAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj

  if (!data.request || !data.request.dialcodes || !data.contentId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'contentLinkDialCodeAPI', 'Error due to required params are missing', data.request))
    rspObj.errCode = dialCodeMessage.CONTENT_LINK.MISSING_CODE
    rspObj.errMsg = dialCodeMessage.CONTENT_LINK.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

    // Transform request for Ek step
  var reqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'contentLinkDialCodeAPI', 'Request for link the content', {
        body: reqData,
        headers: req.headers
      }))
      contentProvider.contentLinkDialCode(reqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'contentLinkDialCodeAPI', 'Getting error', res))
          rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.CONTENT_LINK.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.CONTENT_LINK.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },
    function (res) {
      rspObj.result = res.result
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'contentLinkDialCodeAPI', 'Return response back to user', rspObj))
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

  if (!data.processId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getDialCodeAPI', 'Error due to required params are missing', {
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
    return response.status(err.code).send(err.data)
  })
}

module.exports.generateDialCodeAPI = generateDialCodeAPI
module.exports.dialCodeListAPI = dialCodeListAPI
module.exports.updateDialCodeAPI = updateDialCodeAPI
module.exports.getDialCodeAPI = getDialCodeAPI
module.exports.contentLinkDialCodeAPI = contentLinkDialCodeAPI
module.exports.getProcessIdStatusAPI = getProcessIdStatusAPI
