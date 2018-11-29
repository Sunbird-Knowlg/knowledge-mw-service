/**
 * @name : lockService.js
 * @description :: Service responsible for locking mechanism
 * @author      :: Sourav Dey
 */

var async = require('async')
var path = require('path')
var respUtil = require('response_util')
var LOG = require('sb_logger_util')
var configUtil = require('sb-config-util')
var request = require('request')

var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')
var lodash = require('lodash')
var dbModel = require('./../utils/cassandraUtil').getConnections('lock')
var Joi = require('joi')

var filename = path.basename(__filename)
var contentMessage = messageUtils.CONTENT
var responseCode = messageUtils.RESPONSE_CODE
var defaultLockExpiryTime = configUtil.getConfig('LOCK_EXPIRY_TIME')

function createLock (req, response) {
  var newDateObj = createExpiryTime()
  var data = req.body
  var rspObj = req.rspObj

  if (!req.get('x-device-id')) {
    rspObj.errCode = contentMessage.CREATE_LOCK.FAILED_CODE
    rspObj.errMsg = contentMessage.CREATE_LOCK.DEVICE_ID_MISSING
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  if (!data.request) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createLockAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.CREATE_LOCK.MISSING_CODE
    rspObj.errMsg = contentMessage.CREATE_LOCK.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var result = validateCreateLockRequestBody(data.request)
  if (result.error) {
    rspObj.errCode = contentMessage.CREATE_LOCK.MISSING_CODE
    rspObj.errMsg = result.error.details[0].message
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.request.resourceId, 'contentLock', '', {})
  }

  async.waterfall([
    function (CBW) {
      checkResourceTypeValidation(req, function (res, msg) {
        if (!res) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createLockAPI',
            'Error due to required params are missing', data.request))
          rspObj.errCode = contentMessage.CREATE_LOCK.FAILED_CODE
          rspObj.errMsg = msg
          rspObj.responseCode = responseCode.CLIENT_ERROR
          return response.status(412).send(respUtil.errorResponse(rspObj))
        }
        CBW()
      })
    },
    function (CBW) {
      dbModel.instance.create_lock.findOne({ resourceId: data.request.resourceId },
        { resourceType: data.request.resourceType }, function (error, result) {
          if (error) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'error while getting data from db',
              'error while getting data from db', data.request))
            rspObj.errCode = contentMessage.CREATE_LOCK.FAILED_CODE
            rspObj.errMsg = contentMessage.CREATE_LOCK.FAILED_MESSAGE
            rspObj.responseCode = responseCode.SERVER_ERROR
            return response.status(500).send(respUtil.errorResponse(rspObj))
          } else if (result) {
            if (req.get('x-device-id') === result.deviceId &&
            req.get('x-authenticated-userid') === result.createdBy) {
              rspObj.errMsg = contentMessage.CREATE_LOCK.SAME_USER_ERR_MSG
              var statusCode = 400
            } else {
              statusCode = 423
              try { var user = JSON.parse(result.creatorInfo).name } catch (e) {
                user = 'another user'
              }
              rspObj.errMsg = contentMessage.CREATE_LOCK.ALREADY_LOCKED.replace(/{{Name}}/g,
                user)
            }
            rspObj.errCode = contentMessage.CREATE_LOCK.FAILED_CODE
            rspObj.responseCode = responseCode.CLIENT_ERROR
            return response.status(statusCode).send(respUtil.errorResponse(rspObj))
          } else {
            var lockObject = new dbModel.instance.create_lock({
              resourceId: data.request.resourceId,
              resourceType: data.request.resourceType,
              resourceInfo: data.request.resourceInfo,
              createdBy: data.request.createdBy,
              creatorInfo: data.request.creatorInfo,
              deviceId: req.get('x-device-id'),
              created_on: new Date(),
              expiresAt: newDateObj
            })

            lockObject.save({ ttl: defaultLockExpiryTime }, function (err) {
              if (err) {
                LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'error while saving data to db',
                  'error while saving lock data from db', err))
                rspObj.errCode = contentMessage.CREATE_LOCK.FAILED_CODE
                rspObj.errMsg = contentMessage.CREATE_LOCK.FAILED_MESSAGE
                rspObj.responseCode = responseCode.SERVER_ERROR
                return response.status(500).send(respUtil.errorResponse(rspObj))
              } else CBW()
            })
          }
        })
    },

    function () {
      rspObj.result.expiresIn = new Date(newDateObj).getTime()
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function refreshLock (req, response) {
  var newDateObj = createExpiryTime()
  var data = req.body
  var rspObj = req.rspObj

  if (!req.get('x-device-id')) {
    rspObj.errCode = contentMessage.REFRESH_LOCK.FAILED_CODE
    rspObj.errMsg = contentMessage.REFRESH_LOCK.DEVICE_ID_MISSING
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  if (!data.request) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createLockAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.REFRESH_LOCK.MISSING_CODE
    rspObj.errMsg = contentMessage.REFRESH_LOCK.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var result = validateCommonRequestBody(data.request)
  if (result.error) {
    rspObj.errCode = contentMessage.REFRESH_LOCK.MISSING_CODE
    rspObj.errMsg = result.error.details[0].message
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.request.resourceId, 'refreshLock', '', {})
  }

  async.waterfall([
    function (CBW) {
      checkResourceTypeValidation(req, function (res, msg) {
        if (!res) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'refreshLockAPI',
            'Error due to required params are missing', data.request))
          rspObj.errCode = contentMessage.REFRESH_LOCK.FAILED_CODE
          rspObj.errMsg = msg
          rspObj.responseCode = responseCode.CLIENT_ERROR
          return response.status(412).send(respUtil.errorResponse(rspObj))
        }
        CBW()
      })
    },
    function (CBW) {
      dbModel.instance.create_lock.findOne({ resourceId: data.request.resourceId },
        { resourceType: data.request.resourceType }, function (error, result) {
          if (error) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'error while getting data from db',
              'error while getting data from db for refreshing lock', data.request))
            rspObj.errCode = contentMessage.REFRESH_LOCK.FAILED_CODE
            rspObj.errMsg = contentMessage.REFRESH_LOCK.FAILED_MESSAGE
            rspObj.responseCode = responseCode.SERVER_ERROR
            return response.status(500).send(respUtil.errorResponse(rspObj))
          } else if (result) {
            if (result.createdBy !== req.get('x-authenticated-userid')) {
              rspObj.errCode = contentMessage.REFRESH_LOCK.FAILED_CODE
              rspObj.errMsg = contentMessage.REFRESH_LOCK.UNAUTHORIZED
              rspObj.responseCode = responseCode.SERVER_ERROR
              return response.status(403).send(respUtil.errorResponse(rspObj))
            }
            var options = { ttl: defaultLockExpiryTime, if_exists: true }
            dbModel.instance.create_lock.update(
              { resourceId: data.request.resourceId },
              { expiresAt: newDateObj }, options, function (err) {
                if (err) {
                  LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'error while updating data to db',
                    'error while updating lock data from db', err))
                  rspObj.errCode = contentMessage.REFRESH_LOCK.FAILED_CODE
                  rspObj.errMsg = contentMessage.REFRESH_LOCK.FAILED_MESSAGE
                  rspObj.responseCode = responseCode.SERVER_ERROR
                  return response.status(500).send(respUtil.errorResponse(rspObj))
                }
                CBW()
              })
          } else {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'no data found from db',
              'no data found from db for refreshing lock', data.request))
            rspObj.errCode = contentMessage.REFRESH_LOCK.FAILED_CODE
            rspObj.errMsg = contentMessage.REFRESH_LOCK.NOT_FOUND_FAILED_MESSAGE
            rspObj.responseCode = responseCode.SERVER_ERROR
            return response.status(400).send(respUtil.errorResponse(rspObj))
          }
        })
    },

    function () {
      rspObj.result.expiresIn = new Date(newDateObj).getTime()
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function retireLock (req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!req.get('x-device-id')) {
    rspObj.errCode = contentMessage.RETIRE_LOCK.FAILED_CODE
    rspObj.errMsg = contentMessage.RETIRE_LOCK.DEVICE_ID_MISSING
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  if (!data.request) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createLockAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.RETIRE_LOCK.MISSING_CODE
    rspObj.errMsg = contentMessage.RETIRE_LOCK.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  var result = validateCommonRequestBody(data.request)
  if (result.error) {
    rspObj.errCode = contentMessage.RETIRE_LOCK.MISSING_CODE
    rspObj.errMsg = result.error.details[0].message
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.request.resourceId, 'retireLock', '', {})
  }

  async.waterfall([
    function (CBW) {
      checkResourceTypeValidation(req, function (res, msg) {
        if (!res) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'refreshLockAPI',
            'Error due to required params are missing', data.request))
          rspObj.errCode = contentMessage.RETIRE_LOCK.FAILED_CODE
          rspObj.errMsg = msg
          rspObj.responseCode = responseCode.CLIENT_ERROR
          return response.status(412).send(respUtil.errorResponse(rspObj))
        }
        CBW()
      })
    },
    function (CBW) {
      dbModel.instance.create_lock.findOne({ resourceId: data.request.resourceId },
        { resourceType: data.request.resourceType }, function (error, result) {
          if (error) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'error while getting data from db',
              'error while getting data from db for retiring lock', data.request))
            rspObj.errCode = contentMessage.RETIRE_LOCK.FAILED_CODE
            rspObj.errMsg = contentMessage.RETIRE_LOCK.FAILED_MESSAGE
            rspObj.responseCode = responseCode.SERVER_ERROR
            return response.status(500).send(respUtil.errorResponse(rspObj))
          } else if (result) {
            if (result.createdBy !== req.get('x-authenticated-userid')) {
              rspObj.errCode = contentMessage.RETIRE_LOCK.FAILED_CODE
              rspObj.errMsg = contentMessage.RETIRE_LOCK.UNAUTHORIZED
              rspObj.responseCode = responseCode.SERVER_ERROR
              return response.status(403).send(respUtil.errorResponse(rspObj))
            }
            dbModel.instance.create_lock.delete({ resourceId: data.request.resourceId },
              { resourceType: data.request.resourceType }, function (err) {
                if (err) {
                  LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'error while deleting data to db',
                    'error while deleting lock data from db', err))
                  rspObj.errCode = contentMessage.RETIRE_LOCK.FAILED_CODE
                  rspObj.errMsg = contentMessage.RETIRE_LOCK.FAILED_MESSAGE
                  rspObj.responseCode = responseCode.SERVER_ERROR
                  return response.status(500).send(respUtil.errorResponse(rspObj))
                } else CBW()
              })
          } else {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'no data found from db',
              'no data found from db for retiring lock', data.request))
            rspObj.errCode = contentMessage.RETIRE_LOCK.FAILED_CODE
            rspObj.errMsg = contentMessage.RETIRE_LOCK.NOT_FOUND_FAILED_MESSAGE
            rspObj.responseCode = responseCode.SERVER_ERROR
            return response.status(500).send(respUtil.errorResponse(rspObj))
          }
        })
    },

    function () {
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function listLock (req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!req.get('x-device-id')) {
    rspObj.errCode = contentMessage.LIST_LOCK.FAILED_CODE
    rspObj.errMsg = contentMessage.LIST_LOCK.DEVICE_ID_MISSING
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data, 'listLock', '', {})
  }

  var query = {}
  if (lodash.get(data, 'request.filters')) {
    if (typeof data.request.filters === 'string') {
      query = { resourceId: { '$in': [ data.request.filters ] } }
    } else {
      query = { resourceId: { '$in': data.request.filters } }
    }
  }

  dbModel.instance.create_lock.find(query, function (error, result) {
    if (error) {
      LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'error while getting data from db',
        'error while fetching lock list data from db', data))
      rspObj.errCode = contentMessage.LIST_LOCK.FAILED_CODE
      rspObj.errMsg = contentMessage.LIST_LOCK.FAILED_MESSAGE
      rspObj.responseCode = responseCode.SERVER_ERROR
      return response.status(500).send(respUtil.errorResponse(rspObj))
    } else {
      rspObj.result.count = result.length
      rspObj.result.data = result
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  })
}

function validateCreateLockRequestBody (request) {
  var schema = Joi.object().keys({
    resourceId: Joi.string().required(),
    resourceType: Joi.string().required(),
    resourceInfo: Joi.string().required(),
    createdBy: Joi.string().required(),
    creatorInfo: Joi.string().required()
  })
  return Joi.validate(request, schema)
}

function validateCommonRequestBody (request) {
  var schema = Joi.object().keys({
    resourceId: Joi.string().required(),
    resourceType: Joi.string().required()
  })
  return Joi.validate(request, schema)
}

function createExpiryTime () {
  return new Date().setTime(new Date().getTime() + (defaultLockExpiryTime * 1000))
}

function checkResourceTypeValidation (req, CBW) {
  switch (lodash.lowerCase(req.body.request.resourceType)) {
  case 'content':
    var httpOptions = {
      url: configUtil.getConfig('SUNBIRD_PORTAL_BASE_URL') + '/api/v1/content/getContentLockValidation',
      headers: req.headers,
      method: 'POST',
      body: req.body,
      json: true
    }
    request(httpOptions, function (err, httpResponse, body) {
      if (err) {
        CBW(false, null)
      }
      CBW(httpResponse.body.result.validation, httpResponse.body.result.message)
    })
    break
  default:
    return false
  }
}

module.exports = { createLock, refreshLock, retireLock, listLock }
