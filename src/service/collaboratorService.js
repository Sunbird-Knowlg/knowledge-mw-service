/**
 * @name : collaboratorService.js
 * @description :: Service responsible for updating collaborators for a content
 * @author      :: Sourav Dey
 */

var async = require('async')
var path = require('path')
var contentProvider = require('sb_content_provider_util')
var respUtil = require('response_util')
var LOG = require('sb_logger_util')
var validatorUtil = require('sb_req_validator_util')
var configUtil = require('sb-config-util')

var contentModel = require('../models/contentModel').CONTENT
var messageUtils = require('./messageUtil')
var utilsService = require('../service/utilsService')
var lodash = require('lodash')
var emailMessage = messageUtils.EMAIL

var filename = path.basename(__filename)
var contentMessage = messageUtils.CONTENT
var responseCode = messageUtils.RESPONSE_CODE

function updateCollaborators (req, response) {
  var data = req.body
  data.contentId = req.params.contentId

  var rspObj = req.rspObj
  // Adding objectData in telemetry
  if (rspObj.telemetryData) {
    rspObj.telemetryData.object = utilsService.getObjectData(data.contentId, 'content', '', {})
  }

  if (!data.request || !data.request.content ||
    !validatorUtil.validate(data.request.content, contentModel.COLLABORATORS)) {
    LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateCollaboratorsAPI',
      'Error due to required params are missing', data.request))
    rspObj.errCode = contentMessage.COLLABORATORS.MISSING_CODE
    rspObj.errMsg = contentMessage.COLLABORATORS.MISSING_MESSAGE
    rspObj.responseCode = responseCode.CLIENT_ERROR
    return response.status(400).send(respUtil.errorResponse(rspObj))
  }

  async.waterfall([

    function (CBW) {
      var qs = {
        mode: 'edit',
        fields: 'versionKey, collaborators, contentType, name, mimeType, framework, status'
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateCollaboratorsAPI',
        'Request to content provider to get the latest version key', {
          contentId: data.contentId,
          query: qs,
          headers: req.headers
        }))
      contentProvider.getContentUsingQuery(data.contentId, qs, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateCollaboratorsAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.COLLABORATORS.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.COLLABORATORS.FAILED_MESSAGE
          rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR
          var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500
          rspObj = utilsService.getErrorResponse(rspObj, res)
          return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
        } else {
          if (res.result.content.status !== 'Draft') {
            rspObj.errCode = contentMessage.COLLABORATORS.FAILED_CODE
            rspObj.errMsg = contentMessage.COLLABORATORS.FAILED_MESSAGE
            rspObj.responseCode = res.result.content.status === 'Retired'
              ? responseCode.RESOURCE_NOT_FOUND : contentMessage.COLLABORATORS.FORBIDDEN
            httpStatus = res.result.content.status === 'Retired'
              ? 404 : 403
            return response.status(httpStatus).send(respUtil.errorResponse(rspObj))
          }
          data.request.content.versionKey = res.result.content.versionKey
          data.request.content.collaborators = lodash.uniq(data.request.content.collaborators)
          var contentInfo = { contentTitle: res.result.content.name,
            contentType: res.result.content.contentType,
            identifier: data.contentId,
            mimeType: res.result.content.mimeType,
            framework: res.result.content.framework }
          compareCollaborators(req, contentInfo, res.result.content.collaborators, data.request.content.collaborators)
          CBW()
        }
      })
    },
    function (CBW) {
      var ekStepReqData = {
        request: data.request
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateCollaboratorsAPI',
        'Request to content provider to update the content', {
          body: ekStepReqData,
          headers: req.headers
        }))
      contentProvider.updateContent(ekStepReqData, data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'updateCollaboratorsAPI',
            'Getting error from content provider', res))
          rspObj.errCode = res && res.params ? res.params.err : contentMessage.COLLABORATORS.FAILED_CODE
          rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.COLLABORATORS.FAILED_MESSAGE
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
      rspObj.result.content_id = res.result.node_id
      rspObj.result.versionKey = res.result.versionKey
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'updateCollaboratorsAPI',
        'Sending response back to user', rspObj))
      return response.status(200).send(respUtil.successResponse(rspObj))
    }
  ])
}

/**
 * Below function is used find the added and removed collaborators list
 * @param {object} req
 * @param {object} contentInfo
 * @param {array} oldCollaboratorsArray
 * @param {array} newCollaboratorsArray
 */
function compareCollaborators (req, contentInfo, oldCollaboratorsArray, newCollaboratorsArray) {
  var addedCollaborators = lodash.difference(newCollaboratorsArray, oldCollaboratorsArray)
  var removedCollaborators = lodash.difference(oldCollaboratorsArray, newCollaboratorsArray)
  notifyCollaborators(req, contentInfo, addedCollaborators, 'addCollaborators')
  notifyCollaborators(req, contentInfo, removedCollaborators, 'removeCollaborators')
}

/**
 * Below function is used send emails to collaborators
 * @param {object} req
 * @param {object} cData
 * @param {array} collaboratorsArray
 * @param {string} emailType
 */
function notifyCollaborators (req, cData, collaboratorsArray, emailType) {
  if (!lodash.isEmpty(collaboratorsArray)) {
    var rspObj = req.rspObj

    async.waterfall([
      function (CBW) {
        var eData = emailType === 'addCollaborators' ? emailMessage.ADD_COLLABORATORS
          : emailMessage.REMOVE_COLLABORATORS
        var subject = eData.SUBJECT
        var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
          .replace(/{{Content title}}/g, cData.contentTitle)
          .replace(/{{Content link}}/g, getContentUrl(cData))
          .replace(/{{User}}/g, req.rspObj.userName)
        var lsEmailData = {
          request: getEmailData(subject, body, collaboratorsArray, eData.TEMPLATE)
        }
        LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, emailType,
          'Request to Leaner service to send email', {
            body: lsEmailData
          }))
        contentProvider.sendEmail(lsEmailData, req.headers, function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, emailType,
              'Sending email failed', res))
            CBW(new Error('Sending email failed'), null)
          } else {
            CBW(null, res)
          }
        })
      },

      function (res) {
        LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, emailType,
          'Email sent successfully', rspObj))
        return (null, true)
      }
    ])
  }
}

/**
 * Below function is used construct content link which will be sent to collaborators
 * @param {object} content
 */
function getContentUrl (content) {
  var baseUrl = configUtil.getConfig('SUNBIRD_PORTAL_BASE_URL') + '/workspace/content/edit'
  if (content.mimeType === 'application/vnd.ekstep.content-collection') {
    return baseUrl + '/collection/' + content.identifier + '/' + content.contentType +
    '/collaborating-on/' + content.framework
  } else if (content.mimeType === 'application/vnd.ekstep.ecml-archive') {
    return baseUrl + '/content/' + content.identifier + '/collaborating-on/' + content.framework
  } else {
    return baseUrl + '/generic/' + content.identifier + '/collaborating-on/' + content.framework
  }
}

/**
 * Below function is used to create email request body
 * @param {string} subject
 * @param {string} body
 * @param {string} recipientUserIds
 * @param {string} emailTemplateType
 */
function getEmailData (subject, body, recipientUserIds, emailTemplateType) {
  var request = {
    subject: subject,
    body: body,
    recipientUserIds: recipientUserIds,
    emailTemplateType: emailTemplateType
  }
  return request
}

module.exports.updateCollaborators = updateCollaborators
