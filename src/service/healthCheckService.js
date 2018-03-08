/**
 * @name : healthCheckService.js
 * @description :: Responsible for check content service health
 * @author      :: Anuj Gupta
 */

var async = require('async')
var contentProvider = require('sb_content_provider_util')
var respUtil = require('response_util')
var path = require('path')
var LOG = require('sb_logger_util')

var messageUtils = require('./messageUtil')
var utilsService = require('./utilsService')
var cassandraUtils = require('../utils/cassandraUtil')
var filename = path.basename(__filename)

var hcMessages = messageUtils.HEALTH_CHECK

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
  delete rsp.responseCode
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
  var checksArrayObj = []
  var isEkStepHealthy
  var isLSHealthy
  var isDbConnected
  async.parallel([
    function (CB) {
      cassandraUtils.checkCassandraDBHealth(function (err, res) {
        if (err || res === false) {
          isDbConnected = false
          checksArrayObj.push(getHealthCheckObj(hcMessages.CASSANDRA_DB.NAME, isDbConnected,
            hcMessages.CASSANDRA_DB.FAILED_CODE, hcMessages.CASSANDRA_DB.FAILED_MESSAGE))
        } else {
          isDbConnected = true
          checksArrayObj.push(getHealthCheckObj(hcMessages.CASSANDRA_DB.NAME, isDbConnected, '', ''))
        }
        CB()
      })
    },
    function (CB) {
      contentProvider.ekStepHealthCheck(function (err, res) {
        if (err) {
          isEkStepHealthy = false
          checksArrayObj.push(getHealthCheckObj(hcMessages.EK_STEP.NAME, isEkStepHealthy,
            hcMessages.EK_STEP.FAILED_CODE, hcMessages.EK_STEP.FAILED_MESSAGE))
        } else if (res && res.result && res.result.healthy) {
          isEkStepHealthy = true
          checksArrayObj.push(getHealthCheckObj(hcMessages.EK_STEP.NAME, isEkStepHealthy, '', ''))
        } else {
          isEkStepHealthy = false
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
          checksArrayObj.push(getHealthCheckObj(hcMessages.LEARNER_SERVICE.NAME,
            isLSHealthy, hcMessages.LEARNER_SERVICE.FAILED_CODE, hcMessages.LEARNER_SERVICE.FAILED_MESSAGE))
        } else if (res && res.result && res.result.response && res.result.response.healthy) {
          isLSHealthy = true
          checksArrayObj.push(getHealthCheckObj(hcMessages.LEARNER_SERVICE.NAME, isLSHealthy, '', ''))
        } else {
          isLSHealthy = false
          checksArrayObj.push(getHealthCheckObj(hcMessages.LEARNER_SERVICE.NAME,
            isLSHealthy, hcMessages.LEARNER_SERVICE.FAILED_CODE, hcMessages.LEARNER_SERVICE.FAILED_MESSAGE))
        }
        CB()
      })
    }
  ], function () {
    var rsp = respUtil.successResponse(rspObj)
    if (isEkStepHealthy && isLSHealthy && isDbConnected) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'checkHealth',
        'Content service is healthy'))
      return response.status(200).send(getHealthCheckResp(rsp, true, checksArrayObj))
    } else {
      LOG.error(utilsService.getLoggerData(rspObj, 'INFO', filename, 'checkHealth',
        'Content service is not healthy', { rsp: checksArrayObj }))
      return response.status(200).send(getHealthCheckResp(rsp, false, checksArrayObj))
    }
  })
}

module.exports.checkHealth = checkHealth
