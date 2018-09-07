var async = require('async')
var path = require('path')
var contentProvider = require('sb_content_provider_util')
var utilsService = require('./utilsService')
var filename = path.basename(__filename)
var LOG = require('sb_logger_util')
var messageUtils = require('./messageUtil')
var emailMessage = messageUtils.EMAIL
var responseCode = messageUtils.RESPONSE_CODE
var configUtil = require('sb-config-util')
var lodash = require('lodash')
/**
 * Offset for fetching reviewer list
 */
var reviewerQueryLimit = 200

/**
 * Below function is used to create email request object
 * @param {string} name
 * @param {string} subject
 * @param {string} body
 * @param {string} actionUrl
 * @param {string} actionName
 * @param {string} emailArray
 * @param {string} recipientUserIds
 * @param {string} emailTemplateType
 * @param {string} imageUrl
 * @param {string} orgName
 * @param {string} fromEmail
 */
function getEmailData (name, subject, body, actionUrl, actionName, emailArray,
  recipientUserIds, emailTemplateType, imageUrl, orgName, fromEmail) {
  var request = {
    name: name,
    subject: subject,
    body: body,
    actionUrl: actionUrl,
    actionName: actionName,
    recipientEmails: emailArray,
    recipientUserIds: recipientUserIds,
    emailTemplateType: emailTemplateType,
    orgImageUrl: imageUrl,
    orgName: orgName,
    fromEmail: fromEmail
  }
  return request
}

/**
 * Below function is used for send email when flag content api called
 * @param {object} req
 * @param {function} callback
 */
function createFlagContentEmail (req, callback) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj

  if (!data.contentId) {
    return callback(new Error('Required content id is missing'), null)
  }
  async.waterfall([
    function (CBW) {
      contentProvider.getContent(data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          callback(new Error('Invalid content id'), null)
        } else {
          data.request.contentData = res.result.content
          CBW()
        }
      })
    },
    function (CBW) {
      var cData = data.request.contentData
      var eData = emailMessage.CREATE_FLAG
      var flagReasons = cData.flagReasons ? cData.flagReasons.toString() : ''
      var subject = eData.SUBJECT.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
      var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
        .replace(/{{Flag reason}}/g, flagReasons)
        .replace(/{{Content status}}/g, cData.status)
      var lsEmailData = {
        request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createFlagContentEmail',
        'Request to Leaner service to send email', {
          body: lsEmailData
        }))
      contentProvider.sendEmail(lsEmailData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'createFlagContentEmail',
            'Sending email failed', res))
          callback(new Error('Sending email failed'), null)
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'createFlagContentEmail',
        'Email sent successfully', rspObj))
      callback(null, true)
    }
  ])
}

/**
 * Below function is used to send email when accept flag api called
 * @param {object} req
 * @param {function} callback
 */
function acceptFlagContentEmail (req, callback) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj

  if (data.contentId) {
    callback(new Error('Content id is missing'), null)
  }
  async.waterfall([
    function (CBW) {
      contentProvider.getContent(data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          callback(new Error('Invalid content id'), null)
        } else {
          data.request.contentData = res.result.content
          CBW()
        }
      })
    },
    function (CBW) {
      var cData = data.request.contentData
      var flagReasons = cData.flagReasons ? cData.flagReasons.toString() : ''
      var eData = emailMessage.ACCEPT_FLAG
      var subject = eData.SUBJECT.replace(/{{Content type}}/g, cData.contentType)
      var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
        .replace(/{{Flag reason}}/g, flagReasons)
      var lsEmailData = {
        request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'acceptFlagContentEmail',
        'Request to Leaner service to send email', {
          body: lsEmailData
        }))
      contentProvider.sendEmail(lsEmailData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'acceptFlagContentEmail',
            'Sending email failed', res))
          callback(new Error('Sending email failed'), null)
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'acceptFlagContentEmail',
        'Email sent successfully', rspObj))
      callback(null, true)
    }
  ])
}

/**
 * Below function is used for send email when reject flag api called
 * @param {object} req
 * @param {function} callback
 */
function rejectFlagContentEmail (req, callback) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj

  if (data.contentId) {
    callback(new Error('Content id is missing'), null)
  }
  async.waterfall([
    function (CBW) {
      contentProvider.getContent(data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          callback(new Error('Invalid content id'), null)
        } else {
          data.request.contentData = res.result.content
          CBW()
        }
      })
    },
    function (CBW) {
      var cData = data.request.contentData
      var eData = emailMessage.REJECT_FLAG
      var subject = eData.SUBJECT.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
      var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
        .replace(/{{Content status}}/g, cData.status)
      var lsEmailData = {
        request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'rejectFlagContentEmail',
        'Request to Leaner service to send email', {
          body: lsEmailData
        }))
      contentProvider.sendEmail(lsEmailData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'rejectFlagContentEmail',
            'Sending email failed', res))
          callback(new Error('Sending email failed'), null)
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'rejectFlagContentEmail',
        'Email sent successfully', rspObj))
      callback(null, true)
    }
  ])
}

/**
 * Below function is used to fetch content details using content id
 * @param {object} req
 */
function getContentDetails (req) {
  return function (callback) {
    contentProvider.getContent(req.params.contentId, req.headers, function (err, result) {
      if (err || result.responseCode !== responseCode.SUCCESS) {
        LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'Call content read API',
          'Getting content details failed', err))
        callback(new Error('Invalid content id'), null)
      } else {
        LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'Call content read API',
          'Getting content details success', result))
        callback(null, result)
      }
    })
  }
}

/**
 * Below function is used to fetch email template using Form API
 * @param {object} formRequest
 */
function getTemplateConfig (formRequest) {
  return function (callback) {
    contentProvider.getForm(formRequest, {}, function (err, result) {
      if (err || result.responseCode !== responseCode.SUCCESS) {
        LOG.error(utilsService.getLoggerData(formRequest, 'ERROR', filename, 'Call Form API failed',
          'Getting template failed', err))
        callback(new Error('Form API failed'), null)
      } else {
        LOG.info(utilsService.getLoggerData(formRequest, 'INFO', filename, 'Call Form API success',
          'Getting template success', result))
        callback(null, result)
      }
    })
  }
}

/**
 * Below function is used to fetch user details
 * @param {object} formRequest
 */
function getUserDetails (req) {
  return function (callback) {
    var data = {
      'request': {
        'filters': {
          'userId': req.get('x-authenticated-userid')
        }
      }
    }
    LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'getUserDetails headers info',
      'getUserDetails headers', req.headers))
    contentProvider.userSearch(data, req.headers, function (err, result) {
      if (err || result.responseCode !== responseCode.SUCCESS) {
        LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'getUserDetails failed',
          'getUserDetails failed', err))
        callback(new Error('User Search failed'), null)
      } else {
        LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'getUserDetails success',
          'getUserDetails success', result))
        callback(null, result)
      }
    })
  }
}

/**
 * Below function is used construct content link which will be sent to the
 * content creator after the content is published
 * @param {object} content
 */
function getPublishedContentUrl (content) {
  var baseUrl = configUtil.getConfig('SUNBIRD_PORTAL_BASE_URL')
  if (content.mimeType === 'application/vnd.ekstep.content-collection') {
    if (content.contentType !== 'Course') {
      return baseUrl + '/resources/play/collection/' + content.identifier
    } else {
      return baseUrl + '/learn/course/' + content.identifier
    }
  } else if (content.mimeType === 'application/vnd.ekstep.ecml-archive') {
    return baseUrl + '/resources/play/content/' + content.identifier
  } else {
    return baseUrl + '/resources/play/content/' + content.identifier
  }
}
/**
 * Below function is used construct content link which will be sent to creator
 * after the content is rejected
 * @param {object} content
 */
function getDraftContentUrl (content) {
  var baseUrl = configUtil.getConfig('SUNBIRD_PORTAL_BASE_URL') + '/workspace/content/edit'
  if (content.mimeType === 'application/vnd.ekstep.content-collection') {
    return baseUrl + '/collection/' + content.identifier + '/' + content.contentType +
    '/draft/' + content.framework
  } else if (content.mimeType === 'application/vnd.ekstep.ecml-archive') {
    return baseUrl + '/content/' + content.identifier + '/draft/' + content.framework
  } else {
    return baseUrl + '/genric/' + content.identifier + '/draft/' + content.framework
  }
}

/**
 * Below function is used construct content link which will be sent to reviewers
 * @param {object} content
 */
function getReviewContentUrl (content) {
  var baseUrl = configUtil.getConfig('SUNBIRD_PORTAL_BASE_URL') + '/workspace/content'
  if (content.mimeType === 'application/vnd.ekstep.content-collection') {
    return baseUrl + '/edit/collection/' + content.identifier + '/' + content.contentType +
    '/upForReview/' + content.framework
  } else if (content.mimeType === 'application/vnd.ekstep.ecml-archive') {
    return baseUrl + '/upForReview/content/' + content.identifier
  } else {
    return baseUrl + '/upForReview/content/' + content.identifier
  }
}

/**
 * Below function is used to send email
 * @param {object} req
 * @param {function} action
 * @param {function} callback
 */
function sendContentEmail (req, action, callback) {
  if (!req.params.contentId) {
    LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, action,
      'Content id is missing', null))
    callback(new Error('Content id is missing'), null)
  }
  var formRequest = {
    request: {
      'type': 'notification',
      'action': action,
      'subType': 'email',
      'rootOrgId': req.get('x-channel-id')
    }
  }
  async.waterfall([
    function (callback) {
      async.parallel({
        contentDetails: getContentDetails(req),
        templateConfig: getTemplateConfig(formRequest)
      }, function (err, results) {
        if (err) {
          callback(err, null)
        } else {
          callback(null, results)
        }
      })
    },
    function (data, callback) {
      if (lodash.get(data.contentDetails, 'result.content') &&
      lodash.get(data.templateConfig, 'result.form.data.fields[0]')) {
        var cData = data.contentDetails.result.content
        var eData = data.templateConfig.result.form.data.fields[0]
        var subject = eData.subject
        var body = eData.body

        // Creating content link for email template
        var contentLink = ''
        if (action === 'requestForChanges') {
          contentLink = getDraftContentUrl(cData)
        } else if (action === 'publish') {
          contentLink = getPublishedContentUrl(cData)
        }

        // Replacing dynamic content data with email template
        subject = subject.replace(/{{Content type}}/g, cData.contentType)
          .replace(/{{Content title}}/g, cData.name)
        body = body.replace(/{{Content type}}/g, cData.contentType)
          .replace(/{{Content title}}/g, cData.name)
          .replace(/{{Content link}}/g, contentLink)
          .replace(/{{Creator name}}/g, req.headers['userName'])
          .replace(/{{Reviewer name}}/g, req.headers['userName'])

        // Fetching email request body for sending email
        var lsEmailData = {
          request: getEmailData(null, subject, body, null, null, null,
            [cData.createdBy], data.templateConfig.result.form.data.templateName,
            eData.logo, eData.orgName, eData.fromEmail)
        }

        contentProvider.sendEmail(lsEmailData, req.headers, function (err, res) {
          if (err || res.responseCode !== responseCode.SUCCESS) {
            LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, action,
              'Sending email failed', err))
            LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, action,
              'Sent email successfully', res))
            callback(new Error('Sending email failed!'), null)
          } else {
            callback(null, data)
          }
        })
      } else {
        callback(new Error('All data not found for sending email'), null)
      }
    }
  ], function (err, data) {
    if (err) {
      LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, action,
        'Sending email failed', err))
      callback(new Error('Sending email failed'), null)
    } else {
      callback(null, true)
    }
  })
}

/**
 * Below function is used for send email when published content api called
 * @param {object} req
 * @param {function} callback
 */
function publishedContentEmail (req, callback) {
  sendContentEmail(req, 'publish', callback)
}

/**
 * Below function is used for send email when review content api called
 * @param {object} req
 * @param {function} callback
 */
function reviewContentEmail (req, callback) {
  if (!req.params.contentId) {
    LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'sendForReview',
      'Content id is missing', null))
    callback(new Error('Content id is missing'), null)
  }
  var formRequest = {
    request: {
      'type': 'notification',
      'action': 'sendForReview',
      'subType': 'email',
      'rootOrgId': req.get('x-channel-id')
    }
  }
  async.waterfall([
    function (callback) {
      async.parallel({
        contentDetails: getContentDetails(req),
        templateConfig: getTemplateConfig(formRequest),
        userDetails: getUserDetails(req)
      }, function (err, results) {
        if (err) {
          LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'get 3 parallel details error',
            'get 3 parallel details failed', err))
          callback(err, null)
        } else {
          LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'get 3 parallel details success',
            'get 3 parallel details success', results))
          callback(null, results)
        }
      })
    },
    function (data, callback) {
      LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'get all data',
        'get all data', data))
      if (lodash.get(data.contentDetails, 'result.content') &&
      lodash.get(data.templateConfig, 'result.form.data.fields[0]') &&
      lodash.get(data.userDetails, 'result.response.content[0].rootOrgId')) {
        var cData = data.contentDetails.result.content
        var eData = data.templateConfig.result.form.data.fields[0]
        var subject = eData.subject
        var body = eData.body

        // Creating content link for email template
        var contentLink = getReviewContentUrl(cData)

        // Replacing dynamic content data with email template
        subject = subject.replace(/{{Content type}}/g, cData.contentType)
          .replace(/{{Content title}}/g, cData.name)
        body = body.replace(/{{Content type}}/g, cData.contentType)
          .replace(/{{Content title}}/g, cData.name)
          .replace(/{{Content link}}/g, contentLink)
          .replace(/{{Creator name}}/g, req.headers['userName'])
          .replace(/{{Reviewer name}}/g, req.headers['userName'])

        getReviwerUserIds(req, data.userDetails.result.response.content[0],
          data.contentDetails.result.content.contentType, function (err, userIds) {
            if (err) {
              LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'userIds error',
                'userIds failed', err))
              callback(new Error('All reviewers data not found'), null)
            } else {
              LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'userIds success',
                'userIds success', userIds))
              // Fetching email request body for sending email
              var lsEmailData = {
                request: getEmailData(null, subject, body, null, null, null,
                  userIds, data.templateConfig.result.form.data.templateName,
                  eData.logo, eData.orgName, eData.fromEmail)
              }
              LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'lsEmailData success',
                'lsEmailData success', lsEmailData))
              contentProvider.sendEmail(lsEmailData, req.headers, function (err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                  LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'sendForReview',
                    'Sending email failed', err))
                  callback(new Error('Sending email failed!'), null)
                } else {
                  LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'sendForReview',
                    'Sent email successfully', res))
                  callback(null, data)
                }
              })
            }
          })
      } else {
        callback(new Error('All data not found for sending email'), null)
      }
    }
  ], function (err, data) {
    if (err) {
      LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'sendForReview',
        'Sending email failed', err))
      callback(new Error('Sending email failed'), null)
    } else {
      LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'final sendEmail success',
        'final sendEmail success', data))
      callback(null, true)
    }
  })
}

/**
 * Below function is used to get all content reviwer ids
 * @param {object} req
 * @param {object} data
 * @param {function} callback
 */
function getReviwerUserIds (req, userdata, contentType, callback) {
  var reviewerRoles = contentType === 'TextBook' ? 'BOOK_REVIEWER' : 'CONTENT_REVIEWER'
  var creatorRoles = contentType === 'TextBook' ? 'BOOK_CREATOR' : 'CONTENT_CREATOR'
  var rootOrgReviewerRequest = {
    'request': {
      'filters': {
        'rootOrgId': userdata.rootOrgId,
        'organisations.roles': reviewerRoles
      },
      'limit': reviewerQueryLimit,
      'offset': 0
    }
  }
  var orgIds = []
  if (lodash.get(userdata, 'organisations[0]')) {
    lodash.forEach(userdata.organisations, function (value) {
      if (lodash.includes(value.roles, creatorRoles)) {
        orgIds.push(value.organisationId)
      }
    })
  }

  var fetchSubOrgReviewers = true
  if (lodash.includes(userdata.roles, creatorRoles) || orgIds) {
    fetchSubOrgReviewers = false
  }
  var subOrgReviewerRequest = {
    'request': {
      'filters': {
        'organisation.organisationId': lodash.uniq(orgIds),
        'organisations.roles': reviewerRoles
      },
      'limit': reviewerQueryLimit,
      'offset': 0
    }
  }
  async.parallel({
    rootOrgReviewers: getUserIds(req, rootOrgReviewerRequest, true),
    subOrgReviewers: getUserIds(req, subOrgReviewerRequest, fetchSubOrgReviewers)
  }, function (err, results) {
    if (err) {
      LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'getReviwerUserIds error',
        'getReviwerUserIds failed', err))
      callback(err, null)
    } else {
      LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'getReviwerUserIds success',
        'getReviwerUserIds success', results))
      var rootOrgReviewersId = lodash.map(results.rootOrgReviewers, 'id')
      var subOrgReviewersId = lodash.map(results.subOrgReviewers, 'id')
      var allReviewerIds = lodash.union(rootOrgReviewersId, subOrgReviewersId)
      callback(null, allReviewerIds)
    }
  })
}

/**
 * Below function is used to get reviewer ids recursively if count is more than 200
 * @param {object} req
 * @param {object} body
 * @param {boolean} fetchDetailsFlag
 */
function getUserIds (req, body, fetchDetailsFlag) {
  if (fetchDetailsFlag) {
    return function (CBW) {
      async.waterfall([
        function (callback) {
          contentProvider.userSearch(body, req.headers, function (err, result) {
            if (err || result.responseCode !== responseCode.SUCCESS) {
              LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'getUserIds 1st 200 error',
                'getUserIds 1st 200 failed', err))
              callback(new Error('User Search failed'), null)
            } else {
              LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'getUserIds 1st 200 success',
                'getUserIds 1st 200 success', result))
              callback(null, {count: result.result.response.count, content: result.result.response.content})
            }
          })
        },
        function (data, callback) {
          if (data.count < reviewerQueryLimit) {
            callback(null, data.content)
          } else {
            var totalCount = 0
            var userDetails = data.content
            totalCount = Math.ceil(data.count / reviewerQueryLimit)
            var parallelFunctions = []
            for (var i = 1; i <= totalCount; i++) {
              var fetchUserIds = function (request) {
                return function (cb) {
                  contentProvider.userSearch(request, req.headers, function (err, result) {
                    if (err || result.responseCode !== responseCode.SUCCESS) {
                      LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'getUserIds recursive error',
                        'getUserIds recursive failed', err))
                      cb(new Error('User Search failed'), null)
                    } else {
                      LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'getUserIds recursive success',
                        'getUserIds recursive success', result))
                      cb(null, result.result.response.content)
                    }
                  })
                }
              }
              var reqBody = lodash.cloneDeep(body)
              reqBody.request.offset = reviewerQueryLimit * i
              parallelFunctions.push(fetchUserIds(reqBody))
            }
            async.parallel(parallelFunctions, function (err, data) {
              if (err) {
                LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'getUserIds parallel error',
                  'getUserIds parallel failed', err))
                callback(new Error('User Search failed'), null)
              } else {
                LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'getUserIds parallel success',
                  'getUserIds parallel success', data))
                lodash.forEach(data, function (userData) {
                  userDetails = userDetails.concat(userData)
                })
                callback(null, userDetails)
              }
            })
          }
        }
      ], function (err, data) {
        if (err) {
          LOG.error(utilsService.getLoggerData(req.rspObj, 'ERROR', filename, 'getUserIds final error',
            'getUserIds final failed', err))
          CBW(new Error('Get user data failed'), null)
        } else {
          LOG.info(utilsService.getLoggerData(req.rspObj, 'INFO', filename, 'getUserIds final success',
            'getUserIds final success', data))
          CBW(null, data)
        }
      })
    }
  } else {
    return function (callback) {
      callback(null, [])
    }
  }
}

/**
 * Below function is used for send email when reject content api called
 * @param {object} req
 * @param {function} callback
 */
function rejectContentEmail (req, callback) {
  sendContentEmail(req, 'requestForChanges', callback)
}

/**
 * [getUnlistedShareUrl Return share url for unlisted content]
 * @param  {[Object]} cData   [content data]
 * @param  {[String]} baseUri [base url]
 * @return {[String]}         [share url]
 */
var getUnlistedShareUrl = function (cData, baseUri) {
  if (cData.contentType === 'Course') {
    return baseUri + '/learn/course' + '/' + cData.identifier + '/Unlisted'
  } else if (cData.mimeType === 'application/vnd.ekstep.content-collection') {
    return baseUri + '/resources/play/collection' + '/' + cData.identifier + '/Unlisted'
  } else {
    return baseUri + '/resources/play/content' + '/' + cData.identifier + '/Unlisted'
  }
}

/**
 * Below function is used for send email when unlist publish content api called
 * @param {object} req
 * @param {function} callback
 */
function unlistedPublishContentEmail (req, callback) {
  var data = req.body
  data.contentId = req.params.contentId
  var rspObj = req.rspObj
  var baseUrl = data.request && data.request.content && data.request.content.baseUrl ? data.request.content.baseUrl : ''

  if (data.contentId) {
    callback(new Error('Content id missing'), null)
  }
  async.waterfall([
    function (CBW) {
      contentProvider.getContent(data.contentId, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          callback(new Error('Invalid content id'), null)
        } else {
          data.request.contentData = res.result.content
          CBW()
        }
      })
    },
    function (CBW) {
      var cData = data.request.contentData
      var eData = emailMessage.UNLISTED_PUBLISH_CONTENT
      var subject = eData.SUBJECT.replace(/{{Content title}}/g, cData.name)
      var shareUrl = getUnlistedShareUrl(cData, baseUrl)
      var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
        .replace(/{{Content title}}/g, cData.name)
        .replace(/{{Share url}}/g, shareUrl)
        .replace(/{{Share url}}/g, shareUrl)
      var lsEmailData = {
        request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
      }
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'unlistedPublishContentEmail',
        'Request to Leaner service to send email', {
          body: lsEmailData
        }))
      contentProvider.sendEmail(lsEmailData, req.headers, function (err, res) {
        if (err || res.responseCode !== responseCode.SUCCESS) {
          LOG.error(utilsService.getLoggerData(rspObj, 'ERROR', filename, 'unlistedPublishContentEmail',
            'Sending email failed', res))
          callback(new Error('Sending email failed'), null)
        } else {
          CBW(null, res)
        }
      })
    },

    function (res) {
      LOG.info(utilsService.getLoggerData(rspObj, 'INFO', filename, 'unlistedPublishContentEmail',
        'Email sent successfully', rspObj))
      callback(null, true)
    }
  ])
}

module.exports.createFlagContentEmail = createFlagContentEmail
module.exports.acceptFlagContentEmail = acceptFlagContentEmail
module.exports.rejectFlagContentEmail = rejectFlagContentEmail
module.exports.publishedContentEmail = publishedContentEmail
module.exports.rejectContentEmail = rejectContentEmail
module.exports.reviewContentEmail = reviewContentEmail
module.exports.unlistedPublishContentEmail = unlistedPublishContentEmail
