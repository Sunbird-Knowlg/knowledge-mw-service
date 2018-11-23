/**
 * @name : lockService.js
 * @description :: Service responsible for locking mechanism
 * @author      :: Sourav Dey
 */

var async = require('async')
var path = require('path')
var respUtil = require('response_util')
var LOG = require('sb_logger_util')
var validatorUtil = require('sb_req_validator_util')
var configUtil = require('sb-config-util')
var request = require('request')

var contentModel = require('../models/contentModel').CONTENT
var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')
var lodash = require('lodash')
var dbModel = require('./../utils/cassandraUtil').getConnections('lock')

var filename = path.basename(__filename)
var contentMessage = messageUtils.CONTENT
var responseCode = messageUtils.RESPONSE_CODE
var defaultLockExpiryTime = configUtil.getConfig('LOCK_EXPIRY_TIME')
var oldDateObj = new Date()
var newDateObj = new Date()
newDateObj.setTime(oldDateObj.getTime() + (defaultLockExpiryTime * 1000))

function createLock (req, response) {
  var data = req.body

  var rspObj = req.rspObj
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.request.resourceId, 'lock', '', {})
  }

  if (!data.request || !validatorUtil.validate(data.request, contentModel.CREATE_LOCK)) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createLockAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.CREATE_LOCK.MISSING_CODE
    rspObj.errMsg = contentMessage.CREATE_LOCK.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      checkResourceTypeValidation(req, function (res) {
        if (!res) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createLockAPI',
            'Error due to required params are missing', data.request))
          rspObj.errCode = contentMessage.CREATE_LOCK.FAILED_CODE
          rspObj.errMsg = contentMessage.CREATE_LOCK.FAILED_MESSAGE
          rspObj.responseCode = responseCode.CLIENT_ERROR
          return response.status(403).send(respUtil.errorResponse(rspObj))
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
            if (result && result.creatorInfo) {
              try { var user = JSON.parse(result.creatorInfo).name } catch (e) {
                user = 'another user'
              }
            }
            rspObj.errCode = contentMessage.CREATE_LOCK.FAILED_CODE
            rspObj.errMsg = contentMessage.CREATE_LOCK.ALREADY_LOCKED.replace(/{{Name}}/g,
              user)
            rspObj.responseCode = responseCode.CLIENT_ERROR
            return response.status(403).send(respUtil.errorResponse(rspObj))
          } else {
            var lockObject = new dbModel.instance.create_lock({
              resourceId: data.request.resourceId,
              resourceType: data.request.resourceType,
              resourceInfo: data.request.resourceInfo,
              createdBy: data.request.createdBy,
              creatorInfo: data.request.creatorInfo,
              deviceId: data.request.deviceId,
              created_on: oldDateObj,
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

    function (res) {
      rspObj.result.expiresIn = new Date(newDateObj).getTime()
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

function checkResourceTypeValidation (req, CBW) {
  switch (lodash.lowerCase(req.body.request.resourceType)) {
  case 'content':
    var httpOptions = {
      url: 'http://localhost:5000/v1/content/getContentLock',
      headers: req.headers,
      method: 'POST',
      body: req.body,
      json: true
    }
    request(httpOptions, function (err, httpResponse, body) {
      if (err) {
        CBW(httpResponse.body.result.validation)
      }
      CBW(httpResponse.body.result.validation)
    })
    break
  default:
    return false
  }
}

module.exports.createLock = createLock
