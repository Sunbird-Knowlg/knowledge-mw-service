var _ = require('lodash')
var ColorUtil = require('./../../utils/colorUtil')
var colorConvert = new ColorUtil()
var dbModel = require('./../../utils/cassandraUtil').getConnections('dialcodes')
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
var KafkaService = require('./../../helpers/qrCodeKafkaProducer.js') 

const defaultConfig = {
  "errorCorrectionLevel": "H",
  "pixelsPerBlock": 2,
  "qrCodeMargin": 3,
  "textFontName": "Verdana",
  "textFontSize": 11,
  "textCharacterSpacing": 0.1,
  "imageFormat": "png",
  "colourModel": "Grayscale",
  "imageBorderSize": 1
}

function BatchImageService(config) {
  this.config = _.merge(defaultConfig, config);
}

BatchImageService.prototype.createRequest = function (data, channel, publisher, rspObj, callback) {
  var processId = dbModel.uuid()
  var dialcodes = _.map(data.dialcodes, 'text');
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
  const cdata = [{ id: dialcodes.toString(), type: 'dialCode' }, { id: publisher, type: 'publisher' }]
  if (telemetryData.context) {
    telemetryData.context.cdata = cdata
  }
  telemetryData.edata = auditEventData
  telemetry.audit(telemetryData)

  batch.save(function (error) {
    if (error) {
      LOG.error({ filename, 'error while inserting record :': error })
      callback(error, null)
    } else {
      data.processId = processId;
      KafkaService.sendRecord(data, function(err, res){
        if(err){
          callback(err, null)
        } else {
          callback(null, processId)
        }
      })
      //TODO: Send to Kafka
     
    }
  })
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
      reject(new Error(JSON.stringify({ code: 404, data: respUtil.errorResponse(rspObj) })))
    }
    dbModel.instance.dialcode_batch.findOne({ processid: processUUId }, function (err, batch) {
      if (err) {
        rspObj.errCode = dialCodeMessage.PROCESS.FAILED_CODE
        rspObj.errMsg = dialCodeMessage.PROCESS.FAILED_MESSAGE
        rspObj.responseCode = responseCode.SERVER_ERROR
        reject(new Error(JSON.stringify({ code: 500, data: respUtil.errorResponse(rspObj) })))
      } else if (!batch) {
        rspObj.errCode = dialCodeMessage.PROCESS.NOTFOUND_CODE
        rspObj.errMsg = dialCodeMessage.PROCESS.NOTFOUND_MESSAGE
        rspObj.responseCode = responseCode.RESOURCE_NOT_FOUND
        reject(new Error(JSON.stringify({ code: 404, data: respUtil.errorResponse(rspObj) })))
      } else {
        if (batch.status !== 2) {
          rspObj.result.status = dialCodeMessage.PROCESS.INPROGRESS_MESSAGE
          resolve({ code: 200, data: respUtil.successResponse(rspObj) })
        } else {
          rspObj.result.status = dialCodeMessage.PROCESS.COMPLETED
          rspObj.result.url = batch.url
          resolve({ code: 200, data: respUtil.successResponse(rspObj) })
        }
      }
    })
  })
}

BatchImageService.prototype.configToString = function () {
  return _.mapValues(this.config, _.method('toString'))
}


module.exports = BatchImageService
