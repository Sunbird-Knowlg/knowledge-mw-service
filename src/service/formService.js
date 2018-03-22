/**
 * @file  : formService.js
 * @author: Harish Kumar Gangula
 * @desc  : controller file for handle  form service.
 */

var async = require('async')
var path = require('path')
var respUtil = require('response_util')
var contentProvider = require('sb_content_provider_util')
var LOG = require('sb_logger_util')

var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')

var filename = path.basename(__filename)
var formMessages = messageUtils.FORM
var responseCode = messageUtils.RESPONSE_CODE

/**
 * This controller function helps to get form data
 * @param {object} req
 * @param {object} response
 */
function getForm (req, response) {
  var data = req.body
  var rspObj = req.rspObj

  if (!data.request || !data.request.type || !data.request.subType || !data.request.action) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getForm',
      'Error due to required params are missing', data.request))
    rspObj.errCode = formMessages.READ.MISSING_CODE
    rspObj.errMsg = formMessages.READ.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getForm',
        'Request to learner service to read form data', {
          body: data,
          headers: req.headers
        }))
      var key = data.request.type.toLowerCase() + '.' + data.request.subType.toLowerCase() +
       '.' + data.request.action.toLowerCase()
      var requestData = {
        'request': {
          'rootOrgId': data.request.rootOrgId || '*',
          'keys': [key]
        }
      }
      contentProvider.learnerServiceGetForm(requestData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getForm',
            'Got error from learner service', res))
          rspObj = utilsService.getErrorResponse(rspObj, res, formMessages.READ)
          return response.status(utilsService.getHttpStatus(res)).send(respUtil.errorResponse(rspObj))
        } else {
          var responseData = res
          try {
            var formData = JSON.parse(res.result.tenantPreference[0].data)
            responseData = {
              'result': {
                'form': data.request
              }
            }
            responseData.result.form.data = formData[data.request.framework] || formData['default']
          } catch (error) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'getForm',
              'error while parsing response data', res))
          }

          CBW(null, responseData)
        }
      })
    },
    function (res) {
      rspObj.result = res.result
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'getForm',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

module.exports.getFormRequest = getForm
