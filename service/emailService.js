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


function getEmailData(name, subject, body, downloadUrl, emailArray, idArray) {

    var request = {
        name: name,
        subject: subject,
        body: body,
        downloadUrl: downloadUrl,
        recipientEmails: emailArray,
        recipientUserIds: idArray
    };
    return request;
}

function createFlagContentEmail(req, callback) {
    
    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;

    if (data.contentId) {
        callback(true, null);
    }
    async.waterfall([
        function(CBW) {
            var qs = {
                mode: "edit"
            };
            ekStepUtil.getContentUsingQuery(data.contentId, qs, req.headers, function(err, res) {
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
            var lsEmailData = {
                request: getEmailData(null, eData.SUBJECT, eData.BODY, null, null, [cData.createdBy])
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

function acceptFlagContentEmail(req, callback) {
    
    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;

    if (data.contentId) {
        callback(true, null);
    }
    async.waterfall([
        function(CBW) {
            var qs = {
                mode: "edit"
            };
            ekStepUtil.getContentUsingQuery(data.contentId, qs, req.headers, function(err, res) {
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
            var eData = emailMessage.ACCEPT_FLAG;
            var lsEmailData = {
                request: getEmailData(null, eData.SUBJECT, eData.BODY, null, null, [cData.createdBy])
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

function rejectFlagContentEmail(req, callback) {
    
    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;

    if (data.contentId) {
        callback(true, null);
    }
    async.waterfall([
        function(CBW) {
            var qs = {
                mode: "edit"
            };
            ekStepUtil.getContentUsingQuery(data.contentId, qs, req.headers, function(err, res) {
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
            var lsEmailData = {
                request: getEmailData(null, eData.SUBJECT, eData.BODY, null, null, [cData.createdBy])
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

module.exports.createFlagContentEmail = createFlagContentEmail;
module.exports.acceptFlagContentEmail = acceptFlagContentEmail;
module.exports.rejectFlagContentEmail = rejectFlagContentEmail;