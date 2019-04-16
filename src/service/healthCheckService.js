/**
 * @name : healthCheckService.js
 * @description :: Responsible for check content service health
 * @author      :: Anuj Gupta
 */

var async = require('async')
var contentProvider = require('sb_content_provider_util')
var respUtil = require('response_util')
var path = require('path')
var logger = require('sb_logger_util_v2')
var configUtil = require('sb-config-util')

var messageUtils = require('./messageUtil')
var utilsService = require('./utilsService')
var cassandraUtils = require('../utils/cassandraUtil')
var filename = path.basename(__filename)

var hcMessages = messageUtils.HEALTH_CHECK
var uuidV1 = require('uuid/v1')
var dateFormat = require('dateformat')
var checksArrayObj = []

// Function return to get health check object
function getHealthCheckObj (name, healthy, err, errMsg) {
  return {
    name: name,
    healthy: healthy,
    err: err,
    errmsg: errMsg
  }
};

// Function help to get health check response
function getHealthCheckResp (rsp, healthy, checksArrayObj) {
  rsp.result = {}
  rsp.result.name = messageUtils.SERVICE.NAME
  rsp.result.version = messageUtils.API_VERSION.V1
  rsp.result.healthy = healthy
  rsp.result.check = checksArrayObj
  return rsp
}

/**
 * This function is helps to check health of all dependencies
 * @param {Object} req
 * @param {Object} response
 */
function checkHealth (req, response) {
  var rspObj = req.rspObj
  checksArrayObj = []
  var isEkStepHealthy
  var isLSHealthy
  var isDbConnected
  async.parallel([
    function (CB) {
      cassandraUtils.checkCassandraDBHealth(function (err, res) {
        if (err || res === false) {
          isDbConnected = false
          logger.error({msg: 'CASSANDRA_DB_HEALTH_STATUS is False', err}, req)
          configUtil.setConfig('CASSANDRA_DB_HEALTH_STATUS', 'false')
          checksArrayObj.push(getHealthCheckObj(hcMessages.CASSANDRA_DB.NAME, isDbConnected,
            hcMessages.CASSANDRA_DB.FAILED_CODE, hcMessages.CASSANDRA_DB.FAILED_MESSAGE))
        } else {
          isDbConnected = true
          logger.info({msg: 'CASSANDRA_DB_HEALTH_STATUS is True'}, req)
          configUtil.setConfig('CASSANDRA_DB_HEALTH_STATUS', 'true')
          checksArrayObj.push(getHealthCheckObj(hcMessages.CASSANDRA_DB.NAME, isDbConnected, '', ''))
        }
        CB()
      })
    },
    function (CB) {
      contentProvider.ekStepHealthCheck(function (err, res) {
        if (err) {
          isEkStepHealthy = false
          logger.error({msg: 'EKSTEP_HEALTH_STATUS is False', err}, req)
          configUtil.setConfig('EKSTEP_HEALTH_STATUS', 'false')
          checksArrayObj.push(getHealthCheckObj(hcMessages.EK_STEP.NAME, isEkStepHealthy,
            hcMessages.EK_STEP.FAILED_CODE, hcMessages.EK_STEP.FAILED_MESSAGE))
        } else if (res && res.result && res.result.healthy) {
          isEkStepHealthy = true
          logger.info({msg: 'EKSTEP_HEALTH_STATUS is True'}, req)
          configUtil.setConfig('EKSTEP_HEALTH_STATUS', 'true')
          checksArrayObj.push(getHealthCheckObj(hcMessages.EK_STEP.NAME, isEkStepHealthy, '', ''))
        } else {
          isEkStepHealthy = false
          logger.error({msg: 'EKSTEP_HEALTH_STATUS is False'}, req)
          configUtil.setConfig('EKSTEP_HEALTH_STATUS', 'false')
          checksArrayObj.push(getHealthCheckObj(hcMessages.EK_STEP.NAME, isEkStepHealthy,
            hcMessages.EK_STEP.FAILED_CODE, hcMessages.EK_STEP.FAILED_MESSAGE))
        }
        CB()
      })
    },
    function (CB) {
      contentProvider.learnerServiceHealthCheck(function (err, res) {
        if (err) {
          isLSHealthy = false
          logger.error({msg: 'LEARNER_SERVICE_HEALTH_STATUS is False', err}, req)
          configUtil.setConfig('LEARNER_SERVICE_HEALTH_STATUS', 'false')
          checksArrayObj.push(getHealthCheckObj(hcMessages.LEARNER_SERVICE.NAME,
            isLSHealthy, hcMessages.LEARNER_SERVICE.FAILED_CODE, hcMessages.LEARNER_SERVICE.FAILED_MESSAGE))
        } else if (res && res.result && res.result.response && res.result.response.healthy) {
          isLSHealthy = true
          logger.info({msg: 'LEARNER_SERVICE_HEALTH_STATUS is True'}, req)
          configUtil.setConfig('LEARNER_SERVICE_HEALTH_STATUS', 'true')
          checksArrayObj.push(getHealthCheckObj(hcMessages.LEARNER_SERVICE.NAME, isLSHealthy, '', ''))
        } else {
          isLSHealthy = false
          logger.error({msg: 'LEARNER_SERVICE_HEALTH_STATUS is False'}, req)
          configUtil.setConfig('LEARNER_SERVICE_HEALTH_STATUS', 'false')
          checksArrayObj.push(getHealthCheckObj(hcMessages.LEARNER_SERVICE.NAME,
            isLSHealthy, hcMessages.LEARNER_SERVICE.FAILED_CODE, hcMessages.LEARNER_SERVICE.FAILED_MESSAGE))
        }
        CB()
      })
    }
  ], function () {
    var rsp = respUtil.successResponse(rspObj)
    if (isEkStepHealthy && isLSHealthy && isDbConnected) {
      logger.info({msg: 'Content Service is Healthy', additionalInfo: {healthStatus: checksArrayObj}}, req)
      return response.status(200).send(getHealthCheckResp(rsp, true, checksArrayObj))
    } else {
      logger.error({msg: 'Content Service is not healthy', additionalInfo: {healthStatus: checksArrayObj}}, req)
      return response.status(200).send(getHealthCheckResp(rsp, false, checksArrayObj))
    }
  })
}

/**
 * This function helps to check health for content service and returns 200 on success
 * @param {Object} req
 * @param {Object} response
 */
function checkContentServiceHealth (req, response) {
  var rspObj = req.rspObj
  var rsp = respUtil.successResponse(rspObj)
  return response.status(200).send(getHealthCheckResp(rsp, true))
}

/**
 * This function helps to check health of all dependency services in content service and returns 503 error if any service is down. This is controlled by a global variable
 * @param {Array} dependancyServices
 */
function checkDependantServiceHealth (dependancyServices) {
  return function (req, res, next) {
    if (configUtil.getConfig('CONTENT_SERVICE_HEALTH_CHECK_ENABLED') === 'false') {
      next()
    } else {
      var heathyServiceCount = 0
      dependancyServices.forEach(service => {
        if (service === 'LEARNER' && configUtil.getConfig('LEARNER_SERVICE_HEALTH_STATUS') === 'true') {
          heathyServiceCount++
        } else if (service === 'EKSTEP' && configUtil.getConfig('EKSTEP_HEALTH_STATUS') === 'true') {
          heathyServiceCount++
        } else if (service === 'CASSANDRA' && configUtil.getConfig('CASSANDRA_DB_HEALTH_STATUS') === 'true') {
          heathyServiceCount++
        }
      })

      if (dependancyServices.length !== heathyServiceCount) {
        res.status(503)
        res.send({
          'id': 'api.error',
          'ver': '1.0',
          'ts': dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss:lo'),
          'params': {
            'resmsgid': uuidV1(),
            'msgid': null,
            'status': 'failed',
            'err': 'SERVICE_UNAVAILABLE',
            'errmsg': 'Service is unavailable'
          },
          'responseCode': 'SERVICE_UNAVAILABLE',
          'result': { check: checksArrayObj }
        })
        res.end()
      } else {
        next()
      }
    }
  }
}

module.exports.checkHealth = checkHealth
module.exports.checkContentServiceHealth = checkContentServiceHealth
module.exports.checkDependantServiceHealth = checkDependantServiceHealth
