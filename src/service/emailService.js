var async = require('async');
var path = require('path');
var ekStepUtil = require('sb-ekstep-util');
var utilsService = require('./utilsService');
var respUtil = require('response_util');
var filename = path.basename(__filename);
var LOG = require('sb_logger_util');
var messageUtils = require('./messageUtil');
var emailMessage = messageUtils.EMAIL;
var responseCode = messageUtils.RESPONSE_CODE;

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
 */
function getEmailData(name, subject, body, actionUrl, actionName, emailArray, recipientUserIds, emailTemplateType) {

    var request = {
        name: name,
        subject: subject,
        body: body,
        actionUrl: actionUrl,
        actionName: actionName,
        recipientEmails: emailArray,
        recipientUserIds: recipientUserIds,
        emailTemplateType : emailTemplateType
    };
    return request;
}

/**
 * Below function is used for send email when flag content api called
 * @param {object} req 
 * @param {function} callback 
 */
function createFlagContentEmail(req, callback) {
    
    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;

    if (data.contentId) {
        callback(true, null);
    }
    async.waterfall([
        function(CBW) {
            ekStepUtil.getContent(data.contentId, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    callback(true, null);
                } else {
                    data.request.contentData = res.result.content;
                    CBW();
                }
            });
        },
        function(CBW) {
            var cData = data.request.contentData;
            var eData = emailMessage.CREATE_FLAG;
            var flagReaons = cData.flagReasons ? cData.flagReasons.toString() : '';
            var subject = eData.SUBJECT.replace(/{{Content type}}/g, cData.contentType).replace(/{{Content title}}/g, cData.name);
            var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
                                        .replace(/{{Content title}}/g, cData.name)
                                        .replace(/{{Flag reason}}/g, flagReaons) 
                                        .replace(/{{Content status}}/g, cData.status);
            var lsEmailData = {
                request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
            };
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "createFlagContentEmail", "Request to Leaner service for sending email", {
                body : lsEmailData
            }));
            ekStepUtil.sendEmail(lsEmailData, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "createFlagContentEmail", "Sending email failed", res));
                    callback(true, null);
                } else {
                    CBW(null, res);
                }
            });
        },

        function(res) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "createFlagContentEmail", "Email sent successfully", rspObj));
            callback(null, true);
        }
    ]);
}

/**
 * Below function is used for sending email when accept flag api called
 * @param {object} req 
 * @param {function} callback 
 */
function acceptFlagContentEmail(req, callback) {
    
    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;

    if (data.contentId) {
        callback(true, null);
    }
    async.waterfall([
        function(CBW) {
            ekStepUtil.getContent(data.contentId, req.headers, function(err, res) { 
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    callback(true, null);
                } else {
                    data.request.contentData = res.result.content;
                    CBW();
                }
            });
        },
        function(CBW) {
            var cData = data.request.contentData;
            var flagReaons = cData.flagReasons ? cData.flagReasons.toString() : '';
            var eData = emailMessage.ACCEPT_FLAG;
            var subject = eData.SUBJECT.replace(/{{Content type}}/g, cData.contentType);
            var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
                                        .replace(/{{Content title}}/g, cData.name)
                                        .replace(/{{Flag reason}}/g, flagReaons); 
            var lsEmailData = {
                request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
            };
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "acceptFlagContentEmail", "Request to Leaner service for sending email", {
                body : lsEmailData
            }));
            ekStepUtil.sendEmail(lsEmailData, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "acceptFlagContentEmail", "Sending email failed", res));
                    callback(true, null);
                } else {
                    CBW(null, res);
                }
            });
        },

        function(res) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "acceptFlagContentEmail", "Email sent successfully", rspObj));
            callback(null, true);
        }
    ]);
}

/**
 * Below function is used for send email when reject flag api called
 * @param {object} req 
 * @param {function} callback 
 */
function rejectFlagContentEmail(req, callback) {
    
    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;

    if (data.contentId) {
        callback(true, null);
    }
    async.waterfall([
        function(CBW) {
            ekStepUtil.getContent(data.contentId, req.headers, function(err, res) { 
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    callback(true, null);
                } else {
                    data.request.contentData = res.result.content;
                    CBW();
                }
            });
        },
        function(CBW) {
            var cData = data.request.contentData;
            var eData = emailMessage.REJECT_FLAG;
            var subject = eData.SUBJECT.replace(/{{Content type}}/g, cData.contentType).replace(/{{Content title}}/g, cData.name);
            var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
                                        .replace(/{{Content title}}/g, cData.name)
                                        .replace(/{{Content status}}/g, cData.status);
            var lsEmailData = {
                request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
            };
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "rejectFlagContentEmail", "Request to Leaner service for sending email", {
                body : lsEmailData
            }));
            ekStepUtil.sendEmail(lsEmailData, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "rejectFlagContentEmail", "Sending email failed", res));
                    callback(true, null);
                } else {
                    CBW(null, res);
                }
            });
        },

        function(res) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "rejectFlagContentEmail", "Email sent successfully", rspObj));
            callback(null, true);
        }
    ]);
}

/**
 * Below function is used for send email when published content api called
 * @param {object} req 
 * @param {function} callback 
 */
function publishedContentEmail(req, callback) {
    
    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;

    if (data.contentId) {
        callback(true, null);
    }
    async.waterfall([
        function(CBW) {
            ekStepUtil.getContent(data.contentId, req.headers, function(err, res) { 
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    callback(true, null);
                } else {
                    data.request.contentData = res.result.content;
                    CBW();
                }
            });
        },
        function(CBW) {
            var cData = data.request.contentData;
            var eData = emailMessage.PUBLISHED_CONTENT;
            var subject = eData.SUBJECT.replace(/{{Content type}}/g, cData.contentType).replace(/{{Content title}}/g, cData.name);
            var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
                                        .replace(/{{Content title}}/g, cData.name)
                                        .replace(/{{Content status}}/g, cData.status);
            var lsEmailData = {
                request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
            };
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "publishedContentEmail", "Request to Leaner service for sending email", {
                body : lsEmailData
            }));
            ekStepUtil.sendEmail(lsEmailData, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "publishedContentEmail", "Sending email failed", res));
                    callback(true, null);
                } else {
                    CBW(null, res);
                }
            });
        },

        function(res) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "rejectFlagContentEmail", "Email sent successfully", rspObj));
            callback(null, true);
        }
    ]);
}

/**
 * Below function is used for send email when reject content api called
 * @param {object} req 
 * @param {function} callback 
 */
function rejectContentEmail(req, callback) {
    
    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;

    if (data.contentId) {
        callback(true, null);
    }
    async.waterfall([
        function(CBW) {
            ekStepUtil.getContent(data.contentId, req.headers, function(err, res) { 
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    callback(true, null);
                } else {
                    data.contentData = res.result.content;
                    CBW();
                }
            });
        },
        function(CBW) {
            var cData = data.contentData;
            var eData = emailMessage.REJECT_CONTENT;
            var subject = eData.SUBJECT.replace(/{{Content type}}/g, cData.contentType).replace(/{{Content title}}/g, cData.name);
            var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
                                        .replace(/{{Content title}}/g, cData.name)
                                        .replace(/{{Content status}}/g, cData.status);
            var lsEmailData = {
                request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
            };
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "rejectContentEmail", "Request to Leaner service for sending email", {
                body : lsEmailData
            }));
            ekStepUtil.sendEmail(lsEmailData, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "rejectContentEmail", "Sending email failed", res));
                    callback(true, null);
                } else {
                    CBW(null, res);
                }
            });
        },

        function(res) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "rejectContentEmail", "Email sent successfully", rspObj));
            callback(null, true);
        }
    ]);
}

/**
 * [getBase64Url Return base64 url for unlisted content share]
 * @param  {[String]} type   [content type]
 * @param  {[String]} identifier [contentID]
 * @return {[String]}         [base64 string]
 */
var getBase64Url = function (type, identifier) {
    return new Buffer(type + '/' + identifier).toString('base64')
}

/**
 * [getUnlistedShareUrl Return share url for unlisted content]
 * @param  {[Object]} cData   [content data]
 * @param  {[String]} baseUri [base url]
 * @return {[String]}         [share url]
 */
var getUnlistedShareUrl = function (cData, baseUri) {
    if (cData.contentType === 'Course') {
        return baseUri + '/unlisted' + '/' + getBase64Url('course', cData.identifier)
    } else if (cData.mimeType === 'application/vnd.ekstep.content-collection') {
        return baseUri + '/unlisted' + '/' + getBase64Url('collection', cData.identifier)
    } else {
        return baseUri + '/unlisted' + '/' + getBase64Url('content', cData.identifier)
    }
}

/**
 * Below function is used for send email when unlist publish content api called
 * @param {object} req 
 * @param {function} callback 
 */
function unlistedPublishContentEmail(req, callback) {
    
    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;
    var baseUrl = data.request && data.request.content && data.request.content.baseUrl ? data.request.content.baseUrl : "";

    if (data.contentId) {
        callback(true, null);
    }
    async.waterfall([
        function(CBW) {
            ekStepUtil.getContent(data.contentId, req.headers, function(err, res) { 
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    callback(true, null);
                } else {
                    data.request.contentData = res.result.content;
                    CBW();
                }
            });
        },
        function(CBW) {
            var cData = data.request.contentData;
            var eData = emailMessage.UNLISTED_PUBLISH_CONTENT;
            var subject = eData.SUBJECT.replace(/{{Content title}}/g, cData.name);
            var shareUrl = getUnlistedShareUrl(cData, baseUrl)
            var body = eData.BODY.replace(/{{Content type}}/g, cData.contentType)
                                        .replace(/{{Content title}}/g, cData.name)
                                        .replace(/{{Share url}}/g, shareUrl)
                                        .replace(/{{Share url}}/g, shareUrl);
            var lsEmailData = {
                request: getEmailData(null, subject, body, null, null, null, [cData.createdBy], eData.TEMPLATE)
            };
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "unlistedPublishContentEmail", "Request to Leaner service for sending email", {
                body : lsEmailData
            }));
            ekStepUtil.sendEmail(lsEmailData, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "unlistedPublishContentEmail", "Sending email failed", res));
                    callback(true, null);
                } else {
                    CBW(null, res);
                }
            });
        },

        function(res) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "unlistedPublishContentEmail", "Email sent successfully", rspObj));
            callback(null, true);
        }
    ]);
}

module.exports.createFlagContentEmail = createFlagContentEmail;
module.exports.acceptFlagContentEmail = acceptFlagContentEmail;
module.exports.rejectFlagContentEmail = rejectFlagContentEmail;
module.exports.publishedContentEmail = publishedContentEmail;
module.exports.rejectContentEmail = rejectContentEmail;
module.exports.unlistedPublishContentEmail = unlistedPublishContentEmail;
