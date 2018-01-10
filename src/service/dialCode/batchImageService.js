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

function BatchImageService (config) {
  this.color = config && config.color ? colorConvert.cmykTohex(config.color) : '#000'
  this.backgroundColor = config && config.backgroundColor ? config.backgroundColor : '#ffff'
  this.width = config && config.width ? config.width : '30'
  this.height = config && config.height ? config.height : '30'
  this.margin = config && config.margin ? config.margin : '2'
  this.border = config && (config.border === 'false') ? '0' : '20'
  this.showText = config && (config.showText === 'false') ? '0' : '1'
  this.errCorrectionLevel = config && config.quality && _.indexOf(errorCorrectionLevels, config.quality) ? config.quality : 'H'
}

BatchImageService.prototype.createRequest = function (dialcodes, channel, publisher, callback) {
  var processId = dbModel.uuid()

  var batch = new dbModel.instance.dialcode_batch({
    processid: processId,
    dialcodes: dialcodes,
    config: this.configToString(),
    status: 0,
    channel: channel,
    publisher: publisher
  })
  batch.save(function (error) {
    if (error) {
      LOG.error({filename, 'error while inserting record :': error})
      callback(error, null)
    } else {
      LOG.info({filename, 'successfully inserted record with :': processId})
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
    showText: parseInt(this.showText),
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
      reject({code: 404, data: respUtil.errorResponse(rspObj)})
    }
    dbModel.instance.dialcode_batch.findOne({processid: processUUId}, function (err, batch) {
      if (err) {
        rspObj.errCode = dialCodeMessage.PROCESS.FAILED_CODE
        rspObj.errMsg = dialCodeMessage.PROCESS.FAILED_MESSAGE
        rspObj.responseCode = responseCode.SERVER_ERROR
        reject({code: 500, data: respUtil.errorResponse(rspObj)})
      } else if (!batch) {
        rspObj.errCode = dialCodeMessage.PROCESS.NOTFOUND_CODE
        rspObj.errMsg = dialCodeMessage.PROCESS.NOTFOUND_MESSAGE
        rspObj.responseCode = responseCode.RESOURCE_NOT_FOUND
        reject({code: 404, data: respUtil.errorResponse(rspObj)})
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
