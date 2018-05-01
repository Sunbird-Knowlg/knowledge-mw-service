/**
 * @name : contentService.js
 * @description :: Responsible for handle content service
 * @author      :: Anuj Gupta
 */

var async = require('async')
var multiparty = require('multiparty')
var fs = require('fs')
var randomString = require('randomstring')
var path = require('path')
var contentProvider = require('sb_content_provider_util')
var respUtil = require('response_util')
var LOG = require('sb_logger_util')
var validatorUtil = require('sb_req_validator_util')
var _ = require('underscore')
var lodash = require('lodash')

var contentModel = require('../models/contentModel').CONTENT
var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')
var emailService = require('./emailService')

var filename = path.basename(__filename)
var contentMessage = messageUtils.CONTENT
var compositeMessage = messageUtils.COMPOSITE
var responseCode = messageUtils.RESPONSE_CODE
var reqMsg = messageUtils.REQUEST

/**
 * This function helps to generate code for create course
 * @returns {String}
 */
function getCode () {
  return contentMessage.PREFIX_CODE + randomString.generate(6)
}

/**
 * This function return the mimeType for create course
 * @returns {String}
 */
// function getMimeTypeForContent () {
//   return contentMessage.MIME_TYPE
// }

/**
 * This function return the contentType for create course
 * @returns {String}
 */
function getContentTypeForContent () {
  return contentMessage.CONTENT_TYPE
}

function searchAPI (req, response) {
  return search(compositeMessage.CONTENT_TYPE, req, response)
}

function searchContentAPI (req, response) {
  return search(getContentTypeForContent(), req, response)
}

// This function used for performance log
// function logs (isPLogs, startTime, rspObj, level, file, method, message, data, stacktrace) {
//   if (isPLogs) {
//     LOG.info(utilsService.getPerfLoggerData(rspObj, 'INFO', file, method,
//       'Time taken in ms', {timeInMs: Date.now() - csApiStart}))
//   }
// }

function search (defaultContentTypes, req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!data.request || !data.request.filters) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'searchContentAPI',
      'Error due to required params are missing', data.request))

    rspObj.errCode = contentMessage.SEARCH.MISSING_CODE
    rspObj.errMsg = contentMessage.SEARCH.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  if (!data.request.filters) {
    data.request.filters.contentType = defaultContentTypes
  }
  //    if(!data.request.filters.mimeType) {
  //        data.request.filters.mimeType = getMimeTypeForContent();
  //    }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'searchContentAPI',
        'Request to content provider to search the content', {
          body: ekStepReqData,
          headers: req.headers
        }))
      contentProvider.compositeSearch(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'searchContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.SEARCH.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.SEARCH.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'searchContentAPI',
        'Content searched successfully, We got ' + rspObj.result.count + ' results', {
          contentCount: rspObj.result.count
        }))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to create content and create course in ekStep course
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with htpp status
 */
function createContentAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!data.request || !data.request.content || !validatorUtil.validate(data.request.content, contentModel.CREATE)) {
    // prepare
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createContentAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.CREATE.MISSING_CODE
    rspObj.errMsg = contentMessage.CREATE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Transform request for Ek step
  data.request.content.code = getCode()
  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createContentAPI',
        'Request to content provider to create content', {
          body: ekStepReqData,
          headers: req.headers
        }))
      contentProvider.createContent(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.CREATE.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.CREATE.FAILED_MESSAGE
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
      rspObj.result.content_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createContentAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }

  ])
}

/**
 * This function helps to update content and update course in ekStep course
 * @param {type} req
 * @param {type} response
 * @returns {unresolved}
 */
function updateContentAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId

  var rspObj = req.rspObj
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  if (!data.request || !data.request.content || !validatorUtil.validate(data.request.content, contentModel.UPDATE)) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateContentAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.UPDATE.MISSING_CODE
    rspObj.errMsg = contentMessage.UPDATE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      var qs = {
        mode: 'edit',
        fields: 'versionKey'
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateContentAPI',
        'Request to content provider to get the latest version key', {
          contentId: data.contentId,
          query: qs,
          headers: req.headers
        }))
      contentProvider.getContentUsingQuery(data.contentId, qs, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPDATE.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPDATE.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          data.request.content.versionKey = res.result.content.versionKey
          CBW()
        }
      })
    },
    function (CBW) {
      var ekStepReqData = {
        request: data.request
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateContentAPI',
        'Request to content provider to update the content', {
          body: ekStepReqData,
          headers: req.headers
        }))
      contentProvider.updateContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPDATE.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPDATE.FAILED_MESSAGE
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
      rspObj.result.content_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateContentAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function uploadContentAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  data.queryParams = req.query
  var rspObj = req.rspObj
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  if (!data.queryParams.fileUrl) {
    var form = new multiparty.Form()

    form.parse(req, function (err, fields, files) {
      if (err || (files && Object.keys(files).length === 0)) {
        LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'uploadContentAPI',
          'Error due to upload files are missing', {
            contentId: data.contentId,
            files: files
          }))
        rspObj.errCode = contentMessage.UPLOAD.MISSING_CODE
        rspObj.errMsg = contentMessage.UPLOAD.MISSING_MESSAGE
        rspObj.responseCode = responseCode.CLIENT_ERROR
        return response.status(400).send(respUtil.errorResponse(rspObj))
      }
    })

    form.on('file', function (name, file) {
      var formData = {
        file: {
          value: fs.createReadStream(file.path),
          options: {
            filename: file.originalFilename
          }
        }
      }
      async.waterfall([

        function (CBW) {
          LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'uploadContentAPI',
            'Request to content provider to upload the content', {
              contentId: data.contentId,
              headers: req.headers
            }))
          delete req.headers['content-type']
          contentProvider.uploadContent(formData, data.contentId, req.headers, function (err, res) {
            if (err || res.responseCode !== responseCode.SUCCESS) {
              LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'uploadContentAPI',
                'Getting error from content provider', res))
              rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPLOAD.FAILED_CODE
              rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPLOAD.FAILED_MESSAGE
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
          LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'uploadContentAPI',
            'Sending response back to user', rspObj))
          var modifyRsp = respUtil.successResponse(rspObj)
          modifyRsp.success = true
          return response.status(200).send(modifyRsp)
        }
      ])
    })
  } else {
    var queryString = { fileUrl: data.queryParams.fileUrl }
    async.waterfall([

      function (CBW) {
        LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'uploadContentAPI',
          'Request to content provider to upload the content', {
            contentId: data.contentId,
            headers: req.headers
          }))
        delete req.headers['content-type']
        contentProvider.uploadContentWithFileUrl(data.contentId, queryString, req.headers, function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'uploadContentAPI',
              'Getting error from content provider', res))
            rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPLOAD.FAILED_CODE
            rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPLOAD.FAILED_MESSAGE
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
        LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'uploadContentAPI',
          'Sending response back to user', rspObj))
        var modifyRsp = respUtil.successResponse(rspObj)
        modifyRsp.success = true
        return response.status(200).send(modifyRsp)
      }
    ])
  }
}

function reviewContentAPI (req, response) {
  var data = {
    body: req.body
  }
  data.contentId = req.params.contentId
  var ekStepReqData = {
    request: data.request
  }
  var rspObj = req.rspObj
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'reviewContentAPI',
        'Request to content provider to review the content', {
          req: ekStepReqData,
          contentId: data.contentId,
          headers: req.headers
        }))
      contentProvider.reviewContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        // After check response, we perform other operation
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'reviewContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.REVIEW.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.REVIEW.FAILED_MESSAGE
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
      rspObj.result.content_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'reviewContentAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function publishContentAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj
  data.contentId = req.params.contentId
  var ekStepReqData = {
    request: data.request
  }
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  if (!data.request || !data.request.content || !data.request.content.lastPublishedBy) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'publishContentAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.PUBLISH.MISSING_CODE
    rspObj.errMsg = contentMessage.PUBLISH.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'publishContentAPI',
        'Request to content provider to publish the content', {
          contentId: data.contentId,
          reqData: ekStepReqData,
          headers: req.headers
        }))
      contentProvider.publishContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        // After check response, we perform other operation
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'publishContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.PUBLISH.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.PUBLISH.FAILED_MESSAGE
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
      rspObj.result.content_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      rspObj.result.publishStatus = res.result.publishStatus
      emailService.publishedContentEmail(req, function () { })
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'publishContentAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function getContentAPI (req, response) {
  var data = {}
  data.body = req.body
  data.contentId = req.params.contentId
  data.queryParams = req.query
  var rspObj = req.rspObj
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  if (!data.contentId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getContentAPI',
      'Error due to required params are missing', {
        contentId: data.contentId
      }))
    rspObj.errCode = contentMessage.GET.MISSING_CODE
    rspObj.errMsg = contentMessage.GET.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getContentAPI',
        'Request to content provider to get the content meta data', {
          contentId: data.contentId,
          qs: data.queryParams,
          headers: req.headers
        }))
      contentProvider.getContentUsingQuery(data.contentId, data.queryParams, req.headers, function (err, res) {
        // After check response, we perform other operation
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getContentAPI', 'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function getMyContentAPI (req, response) {
  var request = {
    'filters': {
      // "createdBy": req.userId
      'createdBy': req.params.createdBy,
      'contentType': getContentTypeForContent()
    }

  }
  req.body.request = request
  var ekStepReqData = {
    request: request
  }
  var rspObj = req.rspObj
  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getMyContentAPI',
        'Request to content provider to get user content', {
          body: ekStepReqData,
          headers: req.headers
        }))
      contentProvider.compositeSearch(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getMyContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET_MY.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET_MY.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getMyContentAPI',
        'My Content searched successfully, We got ' + rspObj.result.count + ' results', {
          courseCount: rspObj.result.count
        }))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function retireContentAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj
  var failedContent = []
  var userId = req.headers['x-authenticated-userid']
  var errCode, errMsg, respCode, httpStatus

  if (!data.request || !data.request.contentIds) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'retireContentAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.RETIRE.MISSING_CODE
    rspObj.errMsg = contentMessage.RETIRE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      var ekStepReqData = {
        request: {
          search: {
            identifier: data.request.contentIds
          }
        }
      }
      contentProvider.searchContent(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'searchContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.SEARCH.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.SEARCH.FAILED_MESSAGE
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
      var createdByOfContents = _.uniq(_.pluck(res.result.content, 'createdBy'))
      if (createdByOfContents.length === 1 && createdByOfContents[0] === userId) {
        CBW()
      } else {
        LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'retireContentAPI',
          'Content createdBy and userId field not matched'))
        rspObj.errCode = reqMsg.TOKEN.INVALID_CODE
        rspObj.errMsg = reqMsg.TOKEN.INVALID_MESSAGE
        rspObj.responseCode = responseCode.UNAUTHORIZED_ACCESS
        return response.status(401).send(respUtil.errorResponse(rspObj))
      }
    },

    function (CBW) {
      async.each(data.request.contentIds, function (contentId, CBE) {
        LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'retireContentAPI',
          'Request to content provider to retire content', {
            contentId: contentId,
            headers: req.headers
          }))

        // Adding objectData in telemetry
        if (rspObj.telemetryData) {
          rspObj.telemetryData.object = utilsService.getObjectData(contentId, 'content', '', {})
        }
        contentProvider.retireContent(contentId, req.headers, function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'retireContentAPI',
              'Getting error from content provider', res))
            errCode = res && res.params ? res.params.err : contentMessage.GET_MY.FAILED_CODE
            errMsg = res && res.params ? res.params.errmsg : contentMessage.GET_MY.FAILED_MESSAGE
            respCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
            httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
            failedContent.push({ contentId: contentId, errCode: errCode, errMsg: errMsg })
          }
          CBE(null, null)
        })
      }, function () {
        if (failedContent.length > 0) {
          rspObj.errCode = errCode
          rspObj.errMsg = errMsg
          rspObj.responseCode = respCode
          rspObj.result = failedContent
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW()
        }
      })
    },
    function () {
      rspObj.result = failedContent
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'retireContentAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function rejectContentAPI (req, response) {
  var data = {
    body: req.body
  }
  data.contentId = req.params.contentId
  var rspObj = req.rspObj
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  if (!data.contentId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'rejectContentAPI',
      'Error due to required params are missing', {
        contentId: data.contentId
      }))
    rspObj.errCode = contentMessage.REJECT.MISSING_CODE
    rspObj.errMsg = contentMessage.REJECT.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  var ekStepReqData = {
    request: data.body.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'rejectContentAPI',
        'Request to content provider to reject content', {
          contentId: data.contentId,
          headers: req.headers
        }))
      contentProvider.rejectContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'rejectContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.REJECT.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.REJECT.FAILED_MESSAGE
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
      emailService.rejectContentEmail(req, function () { })
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'rejectContentAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function flagContentAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  if (!data.contentId || !data.request || !data.request.flaggedBy || !data.request.versionKey) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'flagContentAPI',
      'Error due to required params are missing', {
        contentId: data.contentId
      }))
    rspObj.errCode = contentMessage.FLAG.MISSING_CODE
    rspObj.errMsg = contentMessage.FLAG.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'flagContentAPI',
        'Request to content provider to flag the content', {
          contentId: data.contentId,
          body: ekStepReqData,
          headers: req.headers
        }))
      contentProvider.flagContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'flagContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.FLAG.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.FLAG.FAILED_MESSAGE
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
      emailService.createFlagContentEmail(req, function () { })
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'flagContentAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function acceptFlagContentAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  if (!data.contentId || !data.request) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'acceptFlagContentAPI',
      'Error due to required params are missing', {
        contentId: data.contentId
      }))
    rspObj.errCode = contentMessage.ACCEPT_FLAG.MISSING_CODE
    rspObj.errMsg = contentMessage.ACCEPT_FLAG.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'acceptFlagContentAPI',
        'Request to content provider to accept flag', {
          contentId: data.contentId,
          body: ekStepReqData,
          headers: req.headers
        }))
      contentProvider.acceptFlagContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'acceptFlagContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.ACCEPT_FLAG.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.ACCEPT_FLAG.FAILED_MESSAGE
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
      emailService.acceptFlagContentEmail(req, function () { })
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'acceptFlagContentAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function rejectFlagContentAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  if (!data.contentId || !data.request) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'rejectFlagContentAPI',
      'Error due to required params are missing', {
        contentId: data.contentId
      }))
    rspObj.errCode = contentMessage.REJECT_FLAG.MISSING_CODE
    rspObj.errMsg = contentMessage.REJECT_FLAG.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'rejectFlagContentAPI',
        'Request to content provider to reject flag', {
          contentId: data.contentId,
          body: ekStepReqData,
          headers: req.headers
        }))
      contentProvider.rejectFlagContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'rejectFlagContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.REJECT_FLAG.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.REJECT_FLAG.FAILED_MESSAGE
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
      emailService.rejectFlagContentEmail(req, function () { })
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'rejectFlagContentAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function uploadContentUrlAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  if (!data.contentId || !data.request || !data.request.content || !data.request.content.fileName) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'uploadContentUrlAPI',
      'Error due to required params are missing', {
        contentId: data.contentId,
        body: data
      }))
    rspObj.errCode = contentMessage.UPLOAD_URL.MISSING_CODE
    rspObj.errMsg = contentMessage.UPLOAD_URL.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'uploadContentUrlAPI',
        'Request to content provider to get upload content url', {
          contentId: data.contentId,
          body: ekStepReqData,
          headers: req.headers
        }))
      contentProvider.uploadContentUrl(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'uploadContentUrlAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPLOAD_URL.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPLOAD_URL.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'uploadContentUrlAPI',
        'Sending response back to user'))
      var modifyRsp = respUtil.successResponse(rspObj)
      modifyRsp.success = true
      return response.status(200).send(modifyRsp)
    }
  ])
}

function unlistedPublishContentAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj
  data.contentId = req.params.contentId

  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  var ekStepReqData = {
    request: data.request
  }

  if (!data.request || !data.request.content || !data.request.content.lastPublishedBy) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'unlistedPublishContentAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.UNLISTED_PUBLISH.MISSING_CODE
    rspObj.errMsg = contentMessage.UNLISTED_PUBLISH.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'unlistedPublishContentAPI',
        'Request to content provider to unlisted published the content', {
          contentId: data.contentId,
          reqData: ekStepReqData,
          headers: req.headers
        }))
      contentProvider.unlistedPublishContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        // After check response, we perform other operation
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'unlistedPublishContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.UNLISTED_PUBLISH.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UNLISTED_PUBLISH.FAILED_MESSAGE
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
      rspObj.result.content_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      rspObj.result.publishStatus = res.result.publishStatus
      emailService.unlistedPublishContentEmail(req, function () { })
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'unlistedPublishContentAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function assignBadge (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj

  if (!data.request || !data.request.content || !data.request.content.badgeAssertion) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'assignBadgeAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.ASSIGN_BADGE.MISSING_CODE
    rspObj.errMsg = contentMessage.ASSIGN_BADGE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([function (CBW) {
    LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'assignBadgeAPI',
      'Request to content provider to get the content meta data', {
        contentId: data.contentId,
        qs: data.queryParams,
        headers: req.headers
      }))
    contentProvider.getContent(data.contentId, req.headers, function (err, res) {
      if (err || res.responseCode !== responseCode.SUCCESS) {
        LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'assignBadgeAPI',
          'Getting error from content provider', res))
        rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET.FAILED_CODE
        rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET.FAILED_MESSAGE
        rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
        var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
        rspObj = utilsService.getErrorResponse(rspObj, res)
        return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
      } else {
        CBW(null, res)
      }
    })
  }, function (content, CBW) {
    var badgeAssertions = content.result.content.badgeAssertions
    var badges = badgeAssertions || []
    var newBadge = data.request.content.badgeAssertion
    var isBadgeExists = false

    lodash.forEach(badges, function (badge) {
      if (badge.assertionId === newBadge.assertionId &&
        badge.badgeId === newBadge.badgeId &&
        badge.issuerId === newBadge.issuerId) {
        isBadgeExists = true
      }
    })
    if (isBadgeExists === true) {
      rspObj.result = rspObj.result || {}
      rspObj.result.content = rspObj.result.content || {}
      rspObj.result.content.message = 'badge already exist'
      rspObj.responseCode = 'CONFLICT'
      return response.status(409).send(respUtil.successResponse(rspObj))
    } else {
      badges.push(newBadge)
      var requestBody = {
        'request': {
          'content': {
            'badgeAssertions': badges
          }
        }
      }
      contentProvider.systemUpdateContent(requestBody, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPDATE.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPDATE.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    }
  }, function (res) {
    LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'assignBadgeAPI', 'Sending response back to user'))
    rspObj.result = res.result
    return response.status(200).send(respUtil.successResponse(rspObj))
  }])
}

function revokeBadge (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj

  if (!data.request || !data.request.content || !data.request.content.badgeAssertion) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'revokeBadgeAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.REVOKE_BADGE.MISSING_CODE
    rspObj.errMsg = contentMessage.REVOKE_BADGE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  async.waterfall([function (CBW) {
    LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'revokeBadgeAPI',
      'Request to content provider to get the content meta data', {
        contentId: data.contentId,
        qs: data.queryParams,
        headers: req.headers
      }))
    contentProvider.getContent(data.contentId, req.headers, function (err, res) {
      if (err || res.responseCode !== responseCode.SUCCESS) {
        LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'revokeBadgeAPI',
          'Getting error from content provider', res))
        rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET.FAILED_CODE
        rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET.FAILED_MESSAGE
        rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
        var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
        rspObj = utilsService.getErrorResponse(rspObj, res)
        return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
      } else {
        CBW(null, res)
      }
    })
  }, function (content, CBW) {
    var badgeAssertions = content.result.content.badgeAssertions
    var badges = badgeAssertions || []
    var revokeBadge = lodash.cloneDeep(data.request.content.badgeAssertion)
    delete data.request.content.badgeAssertion
    var isbadgeExists = false

    lodash.remove(badges, function (badge) {
      if (badge.assertionId === revokeBadge.assertionId) {
        isbadgeExists = true
        return true
      }
    })
    if (isbadgeExists === false) {
      rspObj.result = rspObj.result || {}
      rspObj.result.content = rspObj.result.content || {}
      rspObj.result.content.message = 'badge not exist'
      return response.status(404).send(respUtil.successResponse(rspObj))
    } else {
      var requestBody = {
        'request': {
          'content': {
            'badgeAssertions': badges
          }
        }
      }
      contentProvider.systemUpdateContent(requestBody, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateContentAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPDATE.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPDATE.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    }
  }, function (res) {
    LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'revokeBadgeAPI', 'Sending response back to user'))
    rspObj.result = res.result
    return response.status(200).send(respUtil.successResponse(rspObj))
  }])
}

/**
 * This function helps to copy content
 * @param {type} req
 * @param {type} response
 * @returns {unresolved}
 */
function copyContentAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId

  var rspObj = req.rspObj
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  if (!data['contentId']) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateContentAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.COPY.MISSING_CODE
    rspObj.errMsg = contentMessage.COPY.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'copyContentAPI',
        'Request to content provider to copy content', {
          body: ekStepReqData,
          headers: req.headers
        }))
      contentProvider.copyContent(ekStepReqData, data['contentId'], req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'copyContentAPI',
            'copy content error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.COPY.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.COPY.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'copyContentAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }

  ])
}

module.exports.searchAPI = searchAPI
module.exports.searchContentAPI = searchContentAPI
module.exports.createContentAPI = createContentAPI
module.exports.updateContentAPI = updateContentAPI
module.exports.uploadContentAPI = uploadContentAPI
module.exports.reviewContentAPI = reviewContentAPI
module.exports.publishContentAPI = publishContentAPI
module.exports.getContentAPI = getContentAPI
module.exports.getMyContentAPI = getMyContentAPI
module.exports.retireContentAPI = retireContentAPI
module.exports.rejectContentAPI = rejectContentAPI
module.exports.flagContentAPI = flagContentAPI
module.exports.acceptFlagContentAPI = acceptFlagContentAPI
module.exports.rejectFlagContentAPI = rejectFlagContentAPI
module.exports.uploadContentUrlAPI = uploadContentUrlAPI
module.exports.unlistedPublishContentAPI = unlistedPublishContentAPI
module.exports.assignBadgeAPI = assignBadge
module.exports.revokeBadgeAPI = revokeBadge
module.exports.copyContentAPI = copyContentAPI
