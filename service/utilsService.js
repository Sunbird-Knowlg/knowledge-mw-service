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
//var LOG = require('sb_logger_util').logger;

var messageUtils = require('./messageUtil');

var proxy = require('express-http-proxy');

var utilsMessage = messageUtils.UTILS;
var responseCode = messageUtils.RESPONSE_CODE;

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

                ekStepUtil.uploadMedia(formData, function(err, res) {
                    if (err || res.responseCode !== responseCode.SUCCESS) {
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
                return response.status(200).send(respUtil.successResponse(rspObj));
            }
        ]);
    });
}

module.exports.uploadMediaAPI = uploadMediaAPI;
