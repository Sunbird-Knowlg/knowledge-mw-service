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
var configUtil = require('sb-config-util')
var LOG = require('sb_logger_util')
var validatorUtil = require('sb_req_validator_util')
var _ = require('underscore')

var contentModel = require('../models/contentModel').CONTENT
var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')
var emailService = require('./emailService')

var filename = path.basename(__filename)
var contentMessage = messageUtils.CONTENT
var compositeMessage = messageUtils.COMPOSITE
var responseCode = messageUtils.RESPONSE_CODE
var hcMessages = messageUtils.HEALTH_CHECK
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
function getMimeTypeForContent () {
  return contentMessage.MIME_TYPE
}

/**
 * This function return the contentType for create course
 * @returns {String}
 */
function getContentTypeForContent () {
  return contentMessage.CONTENT_TYPE
}

function getChecksObj (name, healthy, err, errMsg) {
  return {
    name: name,
    healthy: healthy,
    err: err,
    errmsg: errMsg
  }
};

function getHealthCheckResp (rsp, healthy, checksArrayObj) {
  delete rsp.responseCode
  rsp.result = {}
  rsp.result.name = messageUtils.SERVICE.NAME
  rsp.result.version = messageUtils.API_VERSION.V1
  rsp.result.healthy = healthy
  rsp.result.check = checksArrayObj
  return rsp
}

function checkHealth (req, response) {
  return response.status(200).send('ok')
//     var rspObj = req.rspObj;
//     var checksArrayObj = [];
//     var isEkStepHealthy, isLSHealthy, isDbConnected;
//     var csApiStart = Date.now();
//     async.parallel([
//         function(CB) {
//             var apiCallStart = Date.now();
//             contentProvider.ekStepHealthCheck(function(err, res) {
//                 if(res && res.result && res.result.healthy) {
//                     isEkStepHealthy = true;
//                     checksArrayObj.push(getChecksObj(hcMessages.EK_STEP.NAME, isEkStepHealthy, "", ""));
//                 } else {
//                     isEkStepHealthy = false;
//                     checksArrayObj.push(getChecksObj(hcMessages.EK_STEP.NAME, isEkStepHealthy, hcMessages.EK_STEP.FAILED_CODE, hcMessages.EK_STEP.FAILED_MESSAGE));
//                 }
//                 CB();
//             })
//         },
//         function(CB) {
//             var apiCallStart = Date.now();
//             contentProvider.learnerServiceHealthCheck(function(err, res) {
//                 if(res && res.result && res.result.healthy) {
//                     isLSHealthy = true;
//                     checksArrayObj.push(getChecksObj(hcMessages.LEARNER_SERVICE.NAME, isLSHealthy, "", ""));
//                 } else {
//                     isLSHealthy = false;
//                     checksArrayObj.push(getChecksObj(hcMessages.LEARNER_SERVICE.NAME, isLSHealthy, hcMessages.LEARNER_SERVICE.FAILED_CODE, hcMessages.LEARNER_SERVICE.FAILED_MESSAGE));
//                 }
//                 CB();
//             })
//         }
//     ], function() {
//         if(isEkStepHealthy && isLSHealthy && isDbConnected) {
//             var rsp = respUtil.successResponse(rspObj);
//             return response.status(200).send(getHealthCheckResp(rsp, true, checksArrayObj));
//         } else {
//             var rsp = respUtil.successResponse(rspObj);
//             return response.status(500).send(getHealthCheckResp(rsp, false, checksArrayObj));
//         }
//     });
}

function searchAPI (req, response) {
  return search(compositeMessage.CONTENT_TYPE, req, response)
}

function searchContentAPI (req, response) {
  return search(getContentTypeForContent(), req, response)
}

function logs (isPLogs, startTime, rspObj, level, file, method, message, data, stacktrace) {
  if (isPLogs) { LOG.info(utilsService.getPerfLoggerData(rspObj, 'INFO', file, method, 'Time taken in ms', {timeInMs: Date.now() - csApiStart})) }
}

function search (defaultContentTypes, req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!data.request || !data.request.filters) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'searchContentAPI', 'Error due to required params are missing', data.request))

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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'searchContentAPI', 'Request to content provider for search the content', {
        body: ekStepReqData,
        headers: req.headers
      }))
      contentProvider.compositeSearch(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'searchContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.SEARCH.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.SEARCH.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'searchContentAPI', 'Content searched successfully, We got ' + rspObj.result.count + ' results', {
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
  var data = req.body,
    rspObj = req.rspObj

  if (!data.request || !data.request.content || !validatorUtil.validate(data.request.content, contentModel.CREATE)) {
    // prepare
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createContentAPI', 'Error due to required params are missing', data.request))
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createContentAPI', 'Request to content provider for create the content', {
        body: ekStepReqData,
        headers: req.headers
      }))
      contentProvider.createContent(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.CREATE.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.CREATE.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },
    function (res) {
      rspObj.result.content_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createContentAPI', 'Sending response back to user', rspObj))
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

  if (!data.request || !data.request.content || !validatorUtil.validate(data.request.content, contentModel.UPDATE)) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateContentAPI', 'Error due to required params are missing', data.request))
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateContentAPI', 'Request to content provider for get latest version key', {
        contentId: data.contentId,
        query: qs,
        headers: req.headers
      }))
      contentProvider.getContentUsingQuery(data.contentId, qs, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPDATE.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPDATE.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateContentAPI', 'Request to content provider for update the content', {
        body: ekStepReqData,
        headers: req.headers
      }))
      contentProvider.updateContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPDATE.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPDATE.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      rspObj.result.content_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateContentAPI', 'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function uploadContentAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  data.queryParams = req.query
  var rspObj = req.rspObj

  if (!data.queryParams.fileUrl) {
    var form = new multiparty.Form()

    form.parse(req, function (err, fields, files) {
      if (err || (files && Object.keys(files).length === 0)) {
        LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'uploadContentAPI', 'Error due to upload files are missing', {
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
          LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'uploadContentAPI', 'Request to content provider for upload the content file', {
            contentId: data.contentId,
            headers: req.headers
          }))
          delete req.headers['content-type']
          contentProvider.uploadContent(formData, data.contentId, req.headers, function (err, res) {
            if (err || res.responseCode !== responseCode.SUCCESS) {
              LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'uploadContentAPI', 'Getting error from content provider', res))
              rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPLOAD.FAILED_CODE
              rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPLOAD.FAILED_MESSAGE
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
          LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'uploadContentAPI', 'Sending response back to user', rspObj))
          var modifyRsp = respUtil.successResponse(rspObj)
          modifyRsp.success = true
          return response.status(200).send(modifyRsp)
        }
      ])
    })
  } else {
    var queryString = {fileUrl: data.queryParams.fileUrl}
    async.waterfall([

      function (CBW) {
        LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'uploadContentAPI', 'Request to content provider for upload the content file', {
          contentId: data.contentId,
          headers: req.headers
        }))
        delete req.headers['content-type']
        contentProvider.uploadContentWithFileUrl(data.contentId, queryString, req.headers, function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'uploadContentAPI', 'Getting error from content provider', res))
            rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPLOAD.FAILED_CODE
            rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPLOAD.FAILED_MESSAGE
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
        LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'uploadContentAPI', 'Sending response back to user', rspObj))
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

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'reviewContentAPI', 'Request to content provider for review the content', {
        req: ekStepReqData,
        contentId: data.contentId,
        headers: req.headers
      }))
      contentProvider.reviewContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        // After check response, we perform other operation
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'reviewContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.REVIEW.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.REVIEW.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          CBW(null, res)
        }
      })
    },
    function (res) {
      rspObj.result.content_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'reviewContentAPI', 'Sending response back to user', rspObj))
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

  if (!data.request || !data.request.content || !data.request.content.lastPublishedBy) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'publishContentAPI', 'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.PUBLISH.MISSING_CODE
    rspObj.errMsg = contentMessage.PUBLISH.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'publishContentAPI', 'Request to content provider for published the content', {
        contentId: data.contentId,
        reqData: ekStepReqData,
        headers: req.headers
      }))
      contentProvider.publishContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        // After check response, we perform other operation
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'publishContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.PUBLISH.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.PUBLISH.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'publishContentAPI', 'Sending response back to user', rspObj))
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

  if (!data.contentId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getContentAPI', 'Error due to required params are missing', {
      contentId: data.contentId
    }))
    rspObj.errCode = contentMessage.GET.MISSING_CODE
    rspObj.errMsg = contentMessage.GET.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getContentAPI', 'Request to content provider for get content meta data', {
        contentId: data.contentId,
        qs: data.queryParams,
        headers: req.headers
      }))
      contentProvider.getContentUsingQuery(data.contentId, data.queryParams, req.headers, function (err, res) {
        // After check response, we perform other operation
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getMyContentAPI', 'Request to content provider for get user content', {
        body: ekStepReqData,
        headers: req.headers
      }))
      contentProvider.compositeSearch(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getMyContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET_MY.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET_MY.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getMyContentAPI', 'My Content searched successfully, We got ' + rspObj.result.count + ' results', {
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
    // prepare
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'retireContentAPI', 'Error due to required params are missing', data.request))
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
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'searchContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.SEARCH.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.SEARCH.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
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
        LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'retireContentAPI', 'Content createdBy and userId field not matched'))
        rspObj.errCode = reqMsg.TOKEN.INVALID_CODE
        rspObj.errMsg = reqMsg.TOKEN.INVALID_MESSAGE
        rspObj.responseCode = responseCode.UNAUTHORIZED_ACCESS
        return response.status(401).send(respUtil.errorResponse(rspObj))
      }
    },

    function (CBW) {
      async.each(data.request.contentIds, function (contentId, CBE) {
        LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'retireContentAPI', 'Request to content provider for retire content meta data', {
          contentId: contentId,
          headers: req.headers
        }))
        contentProvider.retireContent(contentId, req.headers, function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'retireContentAPI', 'Getting error from content provider', res))
            errCode = res && res.params ? res.params.err : contentMessage.GET_MY.FAILED_CODE
            errMsg = res && res.params ? res.params.errmsg : contentMessage.GET_MY.FAILED_MESSAGE
            respCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
            httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
            failedContent.push({contentId: contentId, errCode: errCode, errMsg: errMsg})
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'retireContentAPI', 'Sending response back to user'))
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
  if (!data.contentId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'rejectContentAPI', 'Error due to required params are missing', {
      contentId: data.contentId
    }))
    rspObj.errCode = contentMessage.REJECT.MISSING_CODE
    rspObj.errMsg = contentMessage.REJECT.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'rejectContentAPI', 'Request to content provider for reject content meta data', {
        contentId: data.contentId,
        headers: req.headers
      }))
      contentProvider.rejectContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'rejectContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.REJECT.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.REJECT.FAILED_MESSAGE
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
      emailService.rejectContentEmail(req, function () { })
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'rejectContentAPI', 'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function flagContentAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj
  if (!data.contentId || !data.request || !data.request.flaggedBy || !data.request.versionKey) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'flagContentAPI', 'Error due to required params are missing', {
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'flagContentAPI', 'Request to content provider for flag the content meta data', {
        contentId: data.contentId,
        body: ekStepReqData,
        headers: req.headers
      }))
      contentProvider.flagContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'flagContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.FLAG.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.FLAG.FAILED_MESSAGE
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
      emailService.createFlagContentEmail(req, function () { })
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'flagContentAPI', 'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function acceptFlagContentAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj
  if (!data.contentId || !data.request) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'acceptFlagContentAPI', 'Error due to required params are missing', {
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'acceptFlagContentAPI', 'Request to content provider for accept flag', {
        contentId: data.contentId,
        body: ekStepReqData,
        headers: req.headers
      }))
      contentProvider.acceptFlagContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'acceptFlagContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.ACCEPT_FLAG.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.ACCEPT_FLAG.FAILED_MESSAGE
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
      emailService.acceptFlagContentEmail(req, function () { })
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'acceptFlagContentAPI', 'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function rejectFlagContentAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj
  if (!data.contentId || !data.request) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'rejectFlagContentAPI', 'Error due to required params are missing', {
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'rejectFlagContentAPI', 'Request to content provider for reject flag', {
        contentId: data.contentId,
        body: ekStepReqData,
        headers: req.headers
      }))
      contentProvider.rejectFlagContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'rejectFlagContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.REJECT_FLAG.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.REJECT_FLAG.FAILED_MESSAGE
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
      emailService.rejectFlagContentEmail(req, function () { })
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'rejectFlagContentAPI', 'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function uploadContentUrlAPI (req, response) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj
  if (!data.contentId || !data.request || !data.request.content || !data.request.content.fileName) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'uploadContentUrlAPI', 'Error due to required params are missing', {
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'uploadContentUrlAPI', 'Request to content provider for get upload content url', {
        contentId: data.contentId,
        body: ekStepReqData,
        headers: req.headers
      }))
      contentProvider.uploadContentUrl(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'uploadContentUrlAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPLOAD_URL.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPLOAD_URL.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'uploadContentUrlAPI', 'Sending response back to user'))
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
  var ekStepReqData = {
    request: data.request
  }

  if (!data.request || !data.request.content || !data.request.content.lastPublishedBy) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'unlistedPublishContentAPI', 'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.UNLISTED_PUBLISH.MISSING_CODE
    rspObj.errMsg = contentMessage.UNLISTED_PUBLISH.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'unlistedPublishContentAPI', 'Request to content provider for unlisted published the content', {
        contentId: data.contentId,
        reqData: ekStepReqData,
        headers: req.headers
      }))
      contentProvider.unlistedPublishContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        // After check response, we perform other operation
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'unlistedPublishContentAPI', 'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.UNLISTED_PUBLISH.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UNLISTED_PUBLISH.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'unlistedPublishContentAPI', 'Sending response back to user', rspObj))
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
module.exports.checkHealth = checkHealth
module.exports.retireContentAPI = retireContentAPI
module.exports.rejectContentAPI = rejectContentAPI
module.exports.flagContentAPI = flagContentAPI
module.exports.acceptFlagContentAPI = acceptFlagContentAPI
module.exports.rejectFlagContentAPI = rejectFlagContentAPI
module.exports.uploadContentUrlAPI = uploadContentUrlAPI
module.exports.unlistedPublishContentAPI = unlistedPublishContentAPI
