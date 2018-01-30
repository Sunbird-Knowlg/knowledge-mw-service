var _ = require('lodash')
var ColorUtil = require('./../../utils/colorUtil')
var colorConvert = new ColorUtil()
var dbModel = require('./../../utils/cassandraUtil')
var messageUtils = require('./../messageUtil')
var respUtil = require('response_util')
var LOG = require('sb_logger_util')
var path = require('path')
var filename = path.basename(__filename)
var dialCodeMessage = messageUtils.DIALCODE
var responseCode = messageUtils.RESPONSE_CODE
var errorCorrectionLevels = ['L', 'M', 'Q', 'H']
var Telemetry = require('sb_telemetry_util')
var telemetry = new Telemetry()
var batchModelProperties = ['processid', 'dialcodes', 'config', 'status', 'channel', 'publisher']

function BatchImageService (config) {
  this.color = _.get(config, 'color') ? colorConvert.cmykTohex(config.color) : '#000'
  this.backgroundColor = _.get(config, 'backgroundColor') ? config.backgroundColor : '#ffff'
  this.width = _.toString(_.clamp(_.toSafeInteger(_.get(config, 'width')), 30, 32))
  this.height = _.toString(_.clamp(_.toSafeInteger(_.get(config, 'height')), 30, 32))
  this.margin = _.toString(_.clamp(_.toSafeInteger(_.get(config, 'margin')), 3, 100))
  this.border = (config && parseInt(config.border, 10) >= 0) ? parseInt(config.border, 10) : '1'
  this.text = (config && (config.text === false)) ? '0' : '1'
  this.errCorrectionLevel = (config && config.errCorrectionLevel &&
    _.indexOf(errorCorrectionLevels, config.errCorrectionLevel) !== -1) ? config.errCorrectionLevel : 'H'
}

BatchImageService.prototype.createRequest = function (dialcodes, channel, publisher, rspObj, callback) {
  var processId = dbModel.uuid()

  // Below line added for ignore eslint camel case issue.
  /* eslint new-cap: ["error", { "newIsCap": false }] */
  var batch = new dbModel.instance.dialcode_batch({
    processid: processId,
    dialcodes: dialcodes,
    config: this.configToString(),
    status: 0,
    channel: channel,
    publisher: publisher
  })

  // Generate audit event
  var telemetryData = Object.assign({}, rspObj.telemetryData)
  const auditEventData = telemetry.auditEventData(batchModelProperties, 'Create', 'NA')
  const cdata = [{id: dialcodes.toString(), type: 'dialCode'}, {id: publisher, type: 'publisher'}]
  if (telemetryData.context) {
    telemetryData.context.cdata = cdata
  }
  telemetryData.edata = auditEventData
  telemetry.audit(telemetryData)

  batch.save(function (error) {
    if (error) {
      LOG.error({filename, 'error while inserting record :': error})
      callback(error, null)
    } else {
      global.imageBatchProcess.send({processId: processId})
      callback(null, processId)
    }
  })
}

BatchImageService.prototype.getConfig = function () {
  return {
    color: this.color,
    backgroundColor: this.backgroundColor,
    width: parseInt(this.width),
    height: parseInt(this.height),
    margin: parseInt(this.margin),
    border: parseInt(this.border),
    text: parseInt(this.text),
    errCorrectionLevel: this.errCorrectionLevel
  }
}

BatchImageService.prototype.configToString = function () {
  return _.mapValues(this.getConfig(), _.method('toString'))
}

BatchImageService.prototype.getStatus = function (rspObj, processId) {
  return new Promise(function (resolve, reject) {
    try {
      var processUUId = dbModel.uuidFromString(processId)
    } catch (e) {
      console.log('err', e)
      rspObj.errCode = dialCodeMessage.PROCESS.NOTFOUND_CODE
      rspObj.errMsg = dialCodeMessage.PROCESS.NOTFOUND_MESSAGE
      rspObj.responseCode = responseCode.RESOURCE_NOT_FOUND
      reject(new Error(JSON.stringify({code: 404, data: respUtil.errorResponse(rspObj)})))
    }
    dbModel.instance.dialcode_batch.findOne({processid: processUUId}, function (err, batch) {
      if (err) {
        rspObj.errCode = dialCodeMessage.PROCESS.FAILED_CODE
        rspObj.errMsg = dialCodeMessage.PROCESS.FAILED_MESSAGE
        rspObj.responseCode = responseCode.SERVER_ERROR
        reject(new Error(JSON.stringify({code: 500, data: respUtil.errorResponse(rspObj)})))
      } else if (!batch) {
        rspObj.errCode = dialCodeMessage.PROCESS.NOTFOUND_CODE
        rspObj.errMsg = dialCodeMessage.PROCESS.NOTFOUND_MESSAGE
        rspObj.responseCode = responseCode.RESOURCE_NOT_FOUND
        reject(new Error(JSON.stringify({code: 404, data: respUtil.errorResponse(rspObj)})))
      } else {
        if (batch.status !== 2) {
          rspObj.result.status = dialCodeMessage.PROCESS.INPROGRESS_MESSAGE
          resolve({code: 200, data: respUtil.successResponse(rspObj)})
        } else {
          rspObj.result.status = dialCodeMessage.PROCESS.COMPLETED
          rspObj.result.url = batch.url
          resolve({code: 200, data: respUtil.successResponse(rspObj)})
        }
      }
    })
  })
}

module.exports = BatchImageService
