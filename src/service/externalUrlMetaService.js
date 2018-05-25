/**
 * To provide external url related helper methods
 */
const urlMetadata = require('url-metadata')
var messageUtils = require('./messageUtil')
var extUrlMessage = messageUtils.EXTERNAL_URL_META
var path = require('path')
var filename = path.basename(__filename)
var responseCode = messageUtils.RESPONSE_CODE
var respUtil = require('response_util')
var utilsService = require('../service/utilsService')
var LOG = require('sb_logger_util')

function fetchUrlMetaAPI (req, response) {
  return fetchUrlMeta(req, response)
}

function fetchUrlMeta (req, response) {
  var data = req.body.request
  var rspObj = {}
  if (!data['url']) {
    rspObj.errCode = extUrlMessage.FETCH.MISSING_CODE
    rspObj.errMsg = extUrlMessage.FETCH.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  // using 'url-metadata'module fetch meta data of given web link and return response
  urlMetadata(data.url).then(
    function (metadata) {
      rspObj.result = metadata
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'fetchUrlMetaAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    },
    function (error) {
      rspObj.errCode = error.code || extUrlMessage.FETCH.FAILED_CODE
      rspObj.errMsg = extUrlMessage.FETCH.FAILED_MESSAGE
      rspObj.responseCode = responseCode.INTERNAL_SERVER_ERROR
      return response.status(500).send(respUtil.errorResponse(rspObj))
    })
}
module.exports.fetchUrlMetaAPI = fetchUrlMetaAPI
