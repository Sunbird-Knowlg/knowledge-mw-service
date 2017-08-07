/**
 * @name : utilsService.js
 * @description :: Responsible for handle other 
 * @author      :: Anuj Gupta
 */

var async = require('async');
var multiparty = require('multiparty');
var fs = require('fs');
var ekStepUtil = require('sb-ekstep-util');
var respUtil = require('response_util');
var LOG = require('sb_logger_util');
var path = require('path');
var messageUtils = require('./messageUtil');

var filename = path.basename(__filename);
var utilsMessage = messageUtils.UTILS;
var responseCode = messageUtils.RESPONSE_CODE;

/**
 * this function helps to create apiId for error and success responseresponse
 * @param {String} path
 * @returns {getAppIDForRESP.appId|String}
 */
function getAppIDForRESP(path) {

    var arr = path.split(":")[0].split('/').filter(function(n) {
        return n !== "";
    });
    var appId = 'api.' + arr[arr.length - 2] + '.' + arr[arr.length - 1];
    return appId;
}

/**
 * This function helps to upload file or media
 * @param {Object} req
 * @param {Object} response
 */
function uploadMediaAPI(req, response) {

    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;

    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
        if (err || (files && Object.keys(files).length === 0)) {
            LOG.error(getLoggerData(rspObj, "ERROR", filename, "uploadMediaAPI", "Error due to missing or invalid file", {
                contentId: data.contentId
            }));
            rspObj.errCode = utilsMessage.UPLOAD.MISSING_CODE;
            rspObj.errMsg = utilsMessage.UPLOAD.MISSING_MESSAGE;
            rspObj.responseCode = responseCode.CLIENT_ERROR;
            return response.status(400).send(respUtil.errorResponse(rspObj));
        }
    });

    form.on('file', function(name, file) {
        var formData = {
            file: {
                value: fs.createReadStream(file.path),
                options: {
                    filename: file.originalFilename
                }
            }
        };
        async.waterfall([

            function(CBW) {
                LOG.info(getLoggerData(rspObj, "INFO", filename, "uploadMediaAPI", "Request to ekstep for upload media file", {
                    contentId: data.contentId,
                    headers: req.headers
                }));
                delete req.headers['content-type'];
                ekStepUtil.uploadMedia(formData, req.headers, function(err, res) {
                    if (err || res.responseCode !== responseCode.SUCCESS) {
                        LOG.error(getLoggerData(rspObj, "ERROR", filename, "uploadMediaAPI", "Getting error from ekstep", res));
                        rspObj.errCode = utilsMessage.UPLOAD.FAILED_CODE;
                        rspObj.errMsg = utilsMessage.UPLOAD.FAILED_MESSAGE;
                        rspObj.responseCode = res ? res.responseCode : responseCode.SERVER_ERROR;
                        var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500;
                        return response.status(httpStatus).send(respUtil.errorResponse(rspObj));
                    } else {
                        CBW(null, res);
                    }
                });
            },
            function(res) {
                rspObj.result = res.result;
                LOG.info(getLoggerData(rspObj, "INFO", filename, "uploadMediaAPI", "Sending response back to user", rspObj));
                return response.status(200).send(respUtil.successResponse(rspObj));
            }
        ]);
    });
}

function getLoggerData(rspObj, level, file, method, message, data, stacktrace) {

    var data = {
        "eid": "BE_LOG",
        "ets": Date.now(),
        "ver": "1.0",
        "mid": rspObj.msgid,
        "context": {
            "pdata": {
                "id": rspObj.apiId,
                "ver": rspObj.apiVersion
            }
        },
        "edata": {
            "eks": {
                "level": level,
                "class": file,
                "method": method,
                "message": message,
                "data": data,
                "stacktrace": stacktrace
            }
        }
    };

    return data;
}

module.exports.uploadMediaAPI = uploadMediaAPI;
module.exports.getLoggerData = getLoggerData;
module.exports.getAppIDForRESP = getAppIDForRESP;