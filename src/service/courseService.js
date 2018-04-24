/**
 * @name : courseService.js
 * @description :: Responsible for handle course service
 * @author      :: Anuj Gupta
 */

var async = require('async')
var randomString = require('randomstring')
var path = require('path')
var contentProvider = require('sb_content_provider_util')
var respUtil = require('response_util')
var validatorUtil = require('sb_req_validator_util')
var LOG = require('sb_logger_util')
var _ = require('underscore')

var courseModel = require('../models/courseModel').COURSE
var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')

var filename = path.basename(__filename)
var courseMessage = messageUtils.COURSE
var responseCode = messageUtils.RESPONSE_CODE

/**
 * This function help to transform the object body with oldKey and newKey
 * @param {Object} body
 * @param {String} oldKey
 * @param {String} newKey
 * @returns {nm$_courseService.transformReqBody.ekStepReqData}
 */
function transformReqBody (body, oldKey, newKey) {
  var ekStepReqData = {
    request: {}
  }
  for (var key in body) {
    if (key === oldKey) {
      ekStepReqData.request[newKey] = body[oldKey]
      return ekStepReqData
    }
  }
}

/**
 * This function help to transform the object body with oldKey and newKey
 * @param {Object} body
 * @param {String} oldKey
 * @param {String} newKey
 * @returns {nm$_courseService.transformReqBody.ekStepReqData}
 */
function transformResBody (body, oldKey, newKey) {
  var ekStepReqData = body || {}
  for (var key in body) {
    if (key === oldKey) {
      ekStepReqData[newKey] = body[oldKey]
      delete ekStepReqData[oldKey]
      return ekStepReqData
    }
  }
}

/**
 * This function helps to generate code for create content
 * @returns {String}
 */
function getCode () {
  return courseMessage.PREFIX_CODE + randomString.generate(6)
}

/**
 * This function return the mimeType for create course
 * @returns {String}
 */
function getMimeTypeForCourse () {
  return courseMessage.MIME_TYPE
}

/**
 * This function return the contentType for create course
 * @returns {String}
 */
function getContentTypeForCourse () {
  return courseMessage.CONTENT_TYPE
}

/**
 * this function helps to search course using content provider api
 * @param {object} req
 * @param {object} response
 * @returns {Object} object with error or success response with http status code
 */
function searchCourseAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!data.request || !data.request.filters) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'searchCourseAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = courseMessage.SEARCH.MISSING_CODE
    rspObj.errMsg = courseMessage.SEARCH.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  data.request.filters.contentType = getContentTypeForCourse()
  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'searchCourseAPI',
        'Request to content provider to search the course', ekStepReqData))
      contentProvider.compositeSearch(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'searchCourseAPI',
            'Getting error from content provider', res))
          rspObj.errCode = courseMessage.SEARCH.FAILED_CODE
          rspObj.errMsg = courseMessage.SEARCH.FAILED_MESSAGE
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
      if (res.result.content) {
        rspObj.result = transformResBody(res.result, 'content', 'course')
        rspObj.result.count = res.result.count
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'searchCourseAPI',
        'Course searched successfully, We got ' + rspObj.result.count + ' results', {
          courseCount: rspObj.result.count
        }))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * this function helps to create course using content provider api
 * @param {Object} req
 * @param {Object} response
 * @returns {Object} object with error or success response with http status code
 */
function createCourseAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!data.request || !data.request.course || !validatorUtil.validate(data.request.course, courseModel.CREATE)) {
    // prepare
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createCourseAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = courseMessage.CREATE.MISSING_CODE
    rspObj.errMsg = courseMessage.CREATE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Tranform request for Ekstep
  data.request.course.code = getCode()
  data.request.course.mimeType = getMimeTypeForCourse()
  data.request.course.contentType = getContentTypeForCourse()

  var ekStepReqData = transformReqBody(data.request, 'course', 'content')

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createCourseAPI',
        'Request to content provider to create the course', ekStepReqData))
      contentProvider.createContent(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createCourseAPI',
            'Getting error from content provider', res))
          rspObj.errCode = courseMessage.CREATE.MISSING_CODE
          rspObj.errMsg = courseMessage.CREATE.MISSING_MESSAGE
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
      rspObj.result.course_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      // Adding objectData in telemetry
      if (rspObj.telemetryData) {
        rspObj.telemetryData.object = utilsService.getObjectData(rspObj.result.course_id, 'course', '', {})
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createCourseAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }

  ])
}

/**
 * this function helps to update course using content provider api
 * @param {Object} req
 * @param {Object} response
 * @returns {Object} object with error or success response with http status code
 */
function updateCourseAPI (req, response) {
  var data = req.body
  data.courseId = req.params.courseId

  var rspObj = req.rspObj
  // Adding objectData in telemetryData object
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.courseId, 'course', '', {})
  }

  if (!data.request || !data.request.course || !validatorUtil.validate(data.request.course, courseModel.UPDATE)) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateCourseAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = courseMessage.UPDATE.MISSING_CODE
    rspObj.errMsg = courseMessage.UPDATE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Tranform request for Ekstep
  delete data.request.course['mimeType']
  delete data.request.course['contentType']

  async.waterfall([

    function (CBW) {
      var qs = {
        mode: 'edit'
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateCourseAPI',
        'Request to content provider to get latest version key', {
          courseId: data.courseId,
          query: qs
        }))
      contentProvider.getContentUsingQuery(data.courseId, qs, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateCourseAPI',
            'Getting error from content provider', res))
          rspObj.errCode = courseMessage.UPDATE.FAILED_CODE
          rspObj.errMsg = courseMessage.UPDATE.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          data.request.course.versionKey = res.result.content.versionKey
          CBW()
        }
      })
    },
    function (CBW) {
      var ekStepReqData = transformReqBody(data.request, 'course', 'content')
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateCourseAPI',
        'Request to content provider to update the course', ekStepReqData))
      contentProvider.updateContent(ekStepReqData, data.courseId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateCourseAPI',
            'Getting error from content provider', res))
          rspObj.errCode = courseMessage.UPDATE.FAILED_CODE
          rspObj.errMsg = courseMessage.UPDATE.FAILED_MESSAGE
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
      rspObj.result.course_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateCourseAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * this function helps to review course using content provider api
 * @param {Object} req
 * @param {Object} response
 * @returns {Object} object with error or success response with http status code
 */
function reviewCourseAPI (req, response) {
  var data = {
    body: req.body
  }
  var rspObj = req.rspObj
  data.courseId = req.params.courseId

  // Adding objectData in telemetryData object
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.courseId, 'course', '', {})
  }
  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'reviewCourseAPI',
        'Request to content provider to review the course', {
          req: ekStepReqData,
          courseId: data.courseId
        }))

      contentProvider.reviewContent(ekStepReqData, data.courseId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'reviewCourseAPI',
            'Getting error from content provider', res))
          rspObj.errCode = courseMessage.REVIEW.FAILED_CODE
          rspObj.errMsg = courseMessage.REVIEW.FAILED_MESSAGE
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
      rspObj.result.course_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'reviewCourseAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * this function helps to publish course using content provider api
 * @param {Object} req
 * @param {Object} response
 * @returns {Object} object with error or success response with http status code
 */
function publishCourseAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj
  data.courseId = req.params.courseId

  // Adding objectData in telemetryData object
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.courseId, 'course', '', {})
  }

  if (!data.request || !data.request.course || !data.request.course.lastPublishedBy) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'publishCourseAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = courseMessage.PUBLISH.MISSING_CODE
    rspObj.errMsg = courseMessage.PUBLISH.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  var ekStepReqData = transformReqBody(data.request, 'course', 'content')

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'publishCourseAPI',
        'Request to content provider to publish the course', {
          courseId: data.courseId,
          reqData: ekStepReqData
        }))
      contentProvider.publishContent(ekStepReqData, data.courseId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'publishCourseAPI',
            'Getting error from content provider', res))
          rspObj.errCode = courseMessage.PUBLISH.FAILED_CODE
          rspObj.errMsg = courseMessage.PUBLISH.FAILED_MESSAGE
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
      rspObj.result.course_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      rspObj.result.publishStatus = res.result.publishStatus.replace('Content Id', 'Course Id')
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'publishCourseAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * this function helps to get course of user
 * @param {Object} req
 * @param {Object} response
 * @returns {Object} object with error or success response with http status code
 */
function getCourseAPI (req, response) {
  var data = {}
  var rspObj = req.rspObj

  data.body = req.body
  data.courseId = req.params.courseId
  // Adding objectData in telemetryData object
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.courseId, 'course', '', {})
  }

  if (!data.courseId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getCourseAPI',
      'Error due to required params are missing', {
        courseId: data.courseId
      }))
    rspObj.errCode = courseMessage.GET.FAILED_CODE
    rspObj.errMsg = courseMessage.GET.FAILED_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getCourseAPI',
        'Request to content provider to get course meta data', {
          courseId: data.courseId
        }))
      contentProvider.getContent(data.courseId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getCourseAPI',
            'Getting error from content provider', res))
          rspObj.errCode = courseMessage.GET.FAILED_CODE
          rspObj.errMsg = courseMessage.GET.FAILED_MESSAGE
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
      rspObj.result = transformResBody(res.result, 'content', 'course')
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getCourseAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * this function helps to get course of user
 * @param {Object} req
 * @param {Object} response
 * @returns {Object} object with error or success response with http status code
 */
function getMyCourseAPI (req, response) {
  var request = {
    'filters': {
      // "createdBy": req.userId
      'createdBy': req.params.createdBy,
      'contentType': getContentTypeForCourse()
    }

  }
  req.body.request = request
  var ekStepReqData = {
    request: request
  }
  var rspObj = req.rspObj

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getMyCourseAPI',
        'Request to content provider to get user course', ekStepReqData))
      contentProvider.compositeSearch(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getMyCourseAPI',
            'Getting error from content provider', res))
          rspObj.errCode = courseMessage.GET_MY.FAILED_CODE
          rspObj.errMsg = courseMessage.GET_MY.FAILED_MESSAGE
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
      if (res.result.content) {
        rspObj.result = transformResBody(res.result, 'content', 'course')
        rspObj.result.count = res.result.count
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getMyCourseAPI',
        'My Course searched successfully, We got ' + rspObj.result.count + ' results', {
          courseCount: rspObj.result.count
        }))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * this function helps to get course of user
 * @param {Object} req
 * @param {Object} response
 * @returns {Object} object with error or success response with http status code
 */
function getCourseHierarchyAPI (req, response) {
  var data = {}
  var rspObj = req.rspObj

  data.body = req.body
  data.courseId = req.params.courseId
  // Adding objectData in telemetryData object
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.courseId, 'course', '', {})
  }

  if (!data.courseId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getCourseHierarchyAPI',
      'Error due to required params are missing', {
        courseId: data.courseId
      }))
    rspObj.errCode = courseMessage.HIERARCHY.FAILED_CODE
    rspObj.errMsg = courseMessage.HIERARCHY.FAILED_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getCourseHierarchyAPI',
        'Request to content provider to get course hierarchy', {
          courseId: data.courseId
        }))
      contentProvider.contentHierarchy(data.courseId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getCourseHierarchyAPI',
            'Getting error from content provider', res))
          rspObj.errCode = courseMessage.HIERARCHY.FAILED_CODE
          rspObj.errMsg = courseMessage.HIERARCHY.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getCourseHierarchyAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * this function helps to update course hierarchy
 * @param {Object} req
 * @param {Object} response
 * @returns {Object} object with error or success response with http status code
 */
function updateCourseHierarchyAPI (req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!data.request || !data.request.data || !data.request.data.hierarchy) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateCourseHierarchyAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = courseMessage.HIERARCHY_UPDATE.MISSING_CODE
    rspObj.errMsg = courseMessage.HIERARCHY_UPDATE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }
  var hierarchy = data.request.data.hierarchy
  data.courseId = _.findKey(hierarchy, function (item) {
    if (item.root === true) return item
  })

  // Adding objectData in telemetryData object
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.courseId, 'course', '', {})
  }

  async.waterfall([
    function (CBW) {
      var ekStepReqData = {request: data.request}
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateCourseHierarchyAPI',
        'Request to content provider to update the course hierarchy', ekStepReqData))
      contentProvider.contentHierarchyUpdate(ekStepReqData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateCourseHierarchyAPI',
            'Getting error from content provider', res))
          rspObj.errCode = courseMessage.HIERARCHY_UPDATE.FAILED_CODE
          rspObj.errMsg = courseMessage.HIERARCHY_UPDATE.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateCourseHierarchyAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

module.exports.searchCourseAPI = searchCourseAPI
module.exports.createCourseAPI = createCourseAPI
module.exports.updateCourseAPI = updateCourseAPI
module.exports.reviewCourseAPI = reviewCourseAPI
module.exports.publishCourseAPI = publishCourseAPI
module.exports.getCourseAPI = getCourseAPI
module.exports.getMyCourseAPI = getMyCourseAPI
module.exports.getCourseHierarchyAPI = getCourseHierarchyAPI
module.exports.updateCourseHierarchyAPI = updateCourseHierarchyAPI
