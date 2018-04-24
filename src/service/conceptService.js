/**
 * @file  : domainService.js
 * @author: Anuj Gupta
 * @desc  : controller file for handle domain and concepts.
 */

var async = require('async')
var path = require('path')
var respUtil = require('response_util')
var contentProvider = require('sb_content_provider_util')
var LOG = require('sb_logger_util')

var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')

var filename = path.basename(__filename)
var domainMessage = messageUtils.DOMAIN
var responseCode = messageUtils.RESPONSE_CODE

/**
 * This function helps to get all domain from content provider
 * @param {Object} req
 * @param {Object} response
 */
function getDomainsAPI (req, response) {
  var data = {}
  var rspObj = req.rspObj
  data.body = req.body

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getDomainsAPI',
        'Request to content provider for get all domains', {
          headers: req.headers
        }))
      contentProvider.getDomains(req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getDomainsAPI',
            'Getting error from content provider', res))
          rspObj.errCode = domainMessage.GET_DOMAINS.FAILED_CODE
          rspObj.errMsg = domainMessage.GET_DOMAINS.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getDomainsAPI', 'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to get domain from content provider by domainId
 * @param {Object} req
 * @param {Object} response
 */
function getDomainByIDAPI (req, response) {
  var data = {}
  var rspObj = req.rspObj

  data.domainId = req.params.domainId

  if (!data.domainId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getDomainByIDAPI',
      'Error due to required params are missing', data))
    rspObj.errCode = domainMessage.GET_DOMAIN_BY_ID.MISSING_CODE
    rspObj.errMsg = domainMessage.GET_DOMAIN_BY_ID.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getDomainByIDAPI',
        'Request to content provider for get domain by id', {
          body: data,
          headers: req.headers
        }))
      contentProvider.getDomainById(data.domainId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getDomainByIDAPI',
            'Getting error from content provider', res))
          rspObj.errCode = domainMessage.GET_DOMAIN_BY_ID.FAILED_CODE
          rspObj.errMsg = domainMessage.GET_DOMAIN_BY_ID.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getDomainByIDAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to get all object of a domain and object type
 * @param {Object} req
 * @param {Object} response
 */
function getObjectTypesAPI (req, response) {
  var data = {}
  var rspObj = req.rspObj
  data.domainId = req.params.domainId
  data.objectType = req.params.objectType

  if (!data.domainId || !data.objectType) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getObjectTypesAPI',
      'Error due to required params are missing', data))
    rspObj.errCode = domainMessage.GET_OBJECTS.MISSING_CODE
    rspObj.errMsg = domainMessage.GET_OBJECTS.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getObjectTypesAPI',
        'Request to content provider for get object type', {
          body: data,
          headers: req.headers
        }))
      contentProvider.getObjects(data.domainId, data.objectType, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename,
            'getObjectTypesAPI', 'Getting error from content provider', res))
          rspObj.errCode = domainMessage.GET_OBJECTS.FAILED_CODE
          rspObj.errMsg = domainMessage.GET_OBJECTS.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getObjectTypesAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to get object of a domain, object type and object id
 * @param {Object} req
 * @param {Object} response
 */
function getObjectTypeByIDAPI (req, response) {
  var data = {}
  var rspObj = req.rspObj

  data.domainId = req.params.domainId
  data.objectType = req.params.objectType
  data.objectId = req.params.objectId

  if (!data.domainId || !data.objectType || !data.objectId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getObjectTypeByIDAPI',
      'Error due to required params are missing', data))
    rspObj.errCode = domainMessage.GET_OBJECT_BY_ID.MISSING_CODE
    rspObj.errMsg = domainMessage.GET_OBJECT_BY_ID.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getObjectTypeByIDAPI',
        'Request to content provider for get object type using id', {
          body: data,
          headers: req.headers
        }))
      contentProvider.getObjectById(data.domainId, data.objectType, data.objectId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getObjectTypeByIDAPI',
            'Getting error from content provider', res))
          rspObj.errCode = domainMessage.GET_OBJECT_BY_ID.FAILED_CODE
          rspObj.errMsg = domainMessage.GET_OBJECT_BY_ID.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getObjectTypeByIDAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to get concept object by concept id
 * @param {Object} req
 * @param {Object} response
 */
function getConceptByIdAPI (req, response) {
  var data = {}
  var rspObj = req.rspObj
  data.conceptId = req.params.conceptId

  if (!data.conceptId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getConceptByIdAPI',
      'Error due to required params are missing', data))
    rspObj.errCode = domainMessage.GET_OBJECTS.MISSING_CODE
    rspObj.errMsg = domainMessage.GET_OBJECTS.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getConceptByIdAPI',
        'Request to content provider for get concept', {
          body: data,
          headers: req.headers
        }))
      contentProvider.getConceptById(data.conceptId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getConceptByIdAPI',
            'Getting error from content provider', res))
          rspObj.errCode = domainMessage.GET_CONCEPT_BY_ID.FAILED_CODE
          rspObj.errMsg = domainMessage.GET_CONCEPT_BY_ID.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getConceptByIdAPI',
        'Sending response back to user'))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to search object of a domain and object type
 * @param {Object} req
 * @param {Object} response
 */
function searchObjectTypeAPI (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  data.domainId = req.params.domainId
  data.objectType = req.params.objectType

  if (!data.domainId || !data.objectType || !data.request || !data.request.search) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'searchObjectTypeAPI',
      'Error due to required params are missing', data))
    rspObj.errCode = domainMessage.SEARCH_OBJECT_TYPE.MISSING_CODE
    rspObj.errMsg = domainMessage.SEARCH_OBJECT_TYPE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'searchObjectTypeAPI',
        'Request to content provider for search object type', {
          body: data,
          headers: req.headers
        }))
      contentProvider.searchObjectsType(ekStepReqData, data.domainId,
        data.objectType, req.headers, function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'searchObjectTypeAPI',
              'Getting error from content provider', res))
            rspObj.errCode = domainMessage.SEARCH_OBJECT_TYPE.FAILED_CODE
            rspObj.errMsg = domainMessage.SEARCH_OBJECT_TYPE.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'searchObjectTypeAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * This function helps to create object of a domain and object type
 * @param {Object} req
 * @param {Object} response
 */
function createObjectTypeAPI (req, response) {
  var rspObj = req.rspObj

  var data = req.body
  data.domainId = req.params.domainId
  data.objectType = req.params.objectType

  if (!data.domainId || !data.objectType || !data.request || !data.request.object) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createObjectTypeAPI',
      'Error due to required params are missing', data))
    rspObj.errCode = domainMessage.CREATE_OBJECT_TYPE.MISSING_CODE
    rspObj.errMsg = domainMessage.CREATE_OBJECT_TYPE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createObjectTypeAPI',
        'Request to content provider for create object type', {
          body: data,
          headers: req.headers
        }))
      contentProvider.createObjectType(ekStepReqData, data.domainId, data.objectType, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createObjectTypeAPI',
            'Getting error from content provider', res))
          rspObj.errCode = domainMessage.CREATE_OBJECT_TYPE.FAILED_CODE
          rspObj.errMsg = domainMessage.CREATE_OBJECT_TYPE.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createObjectTypeAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/*
 * This function helps to update object of a domain and object type
 * @param {Object} req
 * @param {Object} response
 */
function updateObjectTypeAPI (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  data.domainId = req.params.domainId
  data.objectType = req.params.objectType
  data.objectId = req.params.objectId

  if (!data.domainId || !data.objectType || !data.objectId || !data.request || !data.request.object) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateObjectTypeAPI',
      'Error due to required params are missing', data))
    rspObj.errCode = domainMessage.UPDATE_OBJECT_TYPE.MISSING_CODE
    rspObj.errMsg = domainMessage.UPDATE_OBJECT_TYPE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {
    request: data.request
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateObjectTypeAPI',
        'Request to content provider for update object type', {
          body: data,
          headers: req.headers
        }))
      contentProvider.updateObjectType(ekStepReqData, data.domainId,
        data.objectType, data.objectId, req.headers, function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateObjectTypeAPI',
              'Getting error from content provider', res))
            rspObj.errCode = domainMessage.UPDATE_OBJECT_TYPE.FAILED_CODE
            rspObj.errMsg = domainMessage.UPDATE_OBJECT_TYPE.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateObjectTypeAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/*
 * This function helps to retire object of a domain and object type
 * @param {Object} req
 * @param {Object} response
 */
function retireObjectTypeAPI (req, response) {
  var rspObj = req.rspObj
  var data = req.body
  data.domainId = req.params.domainId
  data.objectType = req.params.objectType
  data.objectId = req.params.objectId

  if (!data.domainId || !data.objectType || !data.objectId) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'retireObjectTypeAPI',
      'Error due to required params are missing', data))
    rspObj.errCode = domainMessage.RETIRE_OBJECT_TYPE.MISSING_CODE
    rspObj.errMsg = domainMessage.RETIRE_OBJECT_TYPE.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var ekStepReqData = {}

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'retireObjectTypeAPI',
        'Request to content provider for retire object type', {
          body: data,
          headers: req.headers
        }))
      contentProvider.retireObjectType(ekStepReqData, data.domainId,
        data.objectType, data.objectId, req.headers, function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'retireObjectTypeAPI',
              'Getting error from content provider', res))
            rspObj.errCode = domainMessage.RETIRE_OBJECT_TYPE.FAILED_CODE
            rspObj.errMsg = domainMessage.RETIRE_OBJECT_TYPE.FAILED_MESSAGE
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
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'retireObjectTypeAPI',
        'Sending response back to user'))
      rspObj.result = res.result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * API to get terms list
 * @param {Object} req
 * @param {Object} response
 */
function listTermsAPI (req, response) {
  var rspObj = req.rspObj
  async.waterfall([
    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'listTermsAPI',
        'Request to content provider for terms list', {
          headers: req.headers
        }))
      contentProvider.listTerms(req.headers, function (err, res) {
        if (err) {
          console.log(err)
        }
        CBW(null, res)
      })
    },
    function (res) {
      rspObj.result = res.result
      var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'listTermsAPI',
        'Sending response back to user'))
      rspObj = utilsService.getErrorResponse(rspObj, res)
      return response.status(httpStatus).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * API to get terms list
 * @param {Object} req
 * @param {Object} response
 */
function listResourceBundlesAPI (req, response) {
  var rspObj = req.rspObj
  async.waterfall([
    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'listResourceBundlesAPI',
        'Request to content provider for terms list', {
          headers: req.headers
        }))
      contentProvider.listResourceBundles(req.headers, function (err, res) {
        if (err) {
          console.log(err)
        }
        CBW(null, res)
      })
    },
    function (res) {
      rspObj.result = res.result
      var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'listResourceBundlesAPI',
        'Sending response back to user'))
      rspObj = utilsService.getErrorResponse(rspObj, res)
      return response.status(httpStatus).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * API to get terms list
 * @param {Object} req
 * @param {Object} response
 */
function listOrdinalsAPI (req, response) {
  var rspObj = req.rspObj
  async.waterfall([
    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'listOrdinalsAPI',
        'Request to content provider for terms list', {
          headers: req.headers
        }))
      contentProvider.listOrdinals(req.headers, function (err, res) {
        if (err) {
          console.log(err)
        }
        CBW(null, res)
      })
    },
    function (res) {
      rspObj.result = res.result
      var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'listOrdinalsAPI',
        'Sending response back to user'))
      rspObj = utilsService.getErrorResponse(rspObj, res)
      return response.status(httpStatus).send(respUtil.successResponse(rspObj))
    }
  ])
}

module.exports.getDomainsAPI = getDomainsAPI
module.exports.getDomainByIDAPI = getDomainByIDAPI
module.exports.getObjectTypesAPI = getObjectTypesAPI
module.exports.getObjectTypeByIDAPI = getObjectTypeByIDAPI
module.exports.getConceptByIdAPI = getConceptByIdAPI
module.exports.searchObjectTypeAPI = searchObjectTypeAPI
module.exports.createObjectTypeAPI = createObjectTypeAPI
module.exports.updateObjectTypeAPI = updateObjectTypeAPI
module.exports.retireObjectTypeAPI = retireObjectTypeAPI
module.exports.listTermsAPI = listTermsAPI
module.exports.listResourceBundlesAPI = listResourceBundlesAPI
module.exports.listOrdinalsAPI = listOrdinalsAPI
