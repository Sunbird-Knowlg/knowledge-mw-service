/**
 * @name : contentService.js
 * @description :: Responsible for handle content service
 * @author      :: Anuj Gupta
 */

var async = require('async');
var multiparty = require('multiparty');
var fs = require('fs');
var randomString = require('randomstring');
var ekStepUtil = require('sb-ekstep-util');
var respUtil = require('response_util');
var configUtil = require('sb-config-util');
var LOG = require('sb_logger_util').logger;
var validatorUtil = require('sb_req_validator_util');
var contentModel = require('../models/contentModel').CONTENT;
var messageUtils = require('./messageUtil');

var contentMessage = messageUtils.CONTENT;
var responseCode = messageUtils.RESPONSE_CODE;

/**
 * This function helps to generate code for create course
 * @returns {String}
 */
function getCode() {
    return configUtil.getConfig('PREFIX_CODE') + randomString.generate(6);
}

/**
 * This function return the mimeType for create course
 * @returns {String}
 */
function getMimeTypeForContent() {
    return contentMessage.MIME_TYPE;
}

/**
 * This function return the contentType for create course
 * @returns {String}
 */
function getContentTypeForContent() {
    return contentMessage.CONTENT_TYPE;
}


function searchContentAPI(req, response) {

    var data = req.body;
    var rspObj = req.rspObj;

    if (!data.request || !data.request.filters) {
        rspObj.errCode = contentMessage.SEARCH.MISSING_CODE;
        rspObj.errMsg = contentMessage.SEARCH.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    if (!data.request.filters.contentType) {
        data.request.filters.contentType = getContentTypeForContent();
    }
    //    if(!data.request.filters.mimeType) {
    //        data.request.filters.mimeType = getMimeTypeForContent();
    //    }

    var ekStepReqData = { request: data.request };

    async.waterfall([

        function(CBW) {
            ekStepUtil.searchContent(ekStepReqData, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    rspObj.errCode = contentMessage.SEARCH.FAILED_CODE;
                    rspObj.errMsg = contentMessage.SEARCH.FAILED_MESSAGE;
                    rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
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
}

/**
 * This function helps to create content and create course in ekStep course
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with htpp status 
 */
function createContentAPI(req, response) {

    var data = req.body;
    var rspObj = req.rspObj;

    if (!data.request || !data.request.content || !validatorUtil.validate(data.request.content, contentModel.CREATE)) {
        //prepare
        rspObj.errCode = contentMessage.CREATE.MISSING_CODE;
        rspObj.errMsg = contentMessage.CREATE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    //Tranform request for Ekstep
    data.request.content.code = getCode();
    data.request.content.createdFor = configUtil.getConfig('CREATED_FOR');
    data.request.content.channel = configUtil.getConfig('CONTENT_CHANNEL');
    var ekStepReqData = { request: data.request };

    async.waterfall([

        function(CBW) {
            ekStepUtil.createContent(ekStepReqData, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    rspObj.errCode = contentMessage.CREATE.FAILED_CODE;
                    rspObj.errMsg = contentMessage.CREATE.FAILED_MESSAGE;
                    rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
                    var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500;
                    return response.status(httpStatus).send(respUtil.errorResponse(rspObj));
                } else {
                    CBW(null, res);
                }
            });
        },
        function(res) {
            rspObj.result.content_id = res.result.node_id;
            rspObj.result.versionKey = res.result.versionKey;
            return response.status(200).send(respUtil.successResponse(rspObj));
        }

    ]);
}

/**
 * This function helps to update content and update course in ekStep course
 * @param {type} req
 * @param {type} response
 * @returns {unresolved}
 */
function updateContentAPI(req, response) {

    var data = req.body;
    data.contentId = req.params.contentId;

    var rspObj = req.rspObj;

    if (!data.request || !data.request.content || !validatorUtil.validate(data.request.content, contentModel.UPDATE)) {
        rspObj.errCode = contentMessage.UPDATE.MISSING_CODE;
        rspObj.errMsg = contentMessage.UPDATE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    async.waterfall([

        function(CBW) {
            var qs = { mode: "edit" };
            ekStepUtil.getContentUsingQuery(data.contentId, qs, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    rspObj.errCode = contentMessage.UPDATE.FAILED_CODE;
                    rspObj.errMsg = contentMessage.UPDATE.FAILED_MESSAGE;
                    rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
                    var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500;
                    return response.status(httpStatus).send(respUtil.errorResponse(rspObj));
                } else {
                    data.request.content.versionKey = res.result.content.versionKey;
                    CBW();
                }
            });
        },
        function(CBW) {
            var ekStepReqData = { request: data.request };
            ekStepUtil.updateContent(ekStepReqData, data.contentId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    rspObj.errCode = contentMessage.UPDATE.FAILED_CODE;
                    rspObj.errMsg = contentMessage.UPDATE.FAILED_MESSAGE;
                    rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
                    var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500;
                    return response.status(httpStatus).send(respUtil.errorResponse(rspObj));
                } else {
                    CBW(null, res);
                }
            });
        },

        function(res) {
            rspObj.result.content_id = res.result.node_id;
            rspObj.result.versionKey = res.result.versionKey;
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function uploadContentAPI(req, response) {

    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;

    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
        if (err || (files && Object.keys(files).length === 0)) {
            rspObj.errCode = contentMessage.UPLOAD.MISSING_CODE;
            rspObj.errMsg = contentMessage.UPLOAD.MISSING_MESSAGE;
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

                ekStepUtil.uploadContent(formData, data.contentId, function(err, res) {
                    if (err || res.responseCode !== responseCode.SUCCESS) {
                        rspObj.errCode = contentMessage.UPLOAD.FAILED_CODE;
                        rspObj.errMsg = contentMessage.UPLOAD.FAILED_MESSAGE;
                        rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
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

function reviewContentAPI(req, response) {

    var data = {
        body: req.body
    };
    data.contentId = req.params.contentId;
    var ekStepReqData = { request: data.request };
    var rspObj = req.rspObj;

    async.waterfall([

        function(CBW) {
            ekStepUtil.reviewContent(ekStepReqData, data.contentId, function(err, res) {
                //After check response, we perform other operation
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    rspObj.errCode = contentMessage.REVIEW.FAILED_CODE;
                    rspObj.errMsg = contentMessage.REVIEW.FAILED_MESSAGE;
                    rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
                    var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500;
                    return response.status(httpStatus).send(respUtil.errorResponse(rspObj));
                } else {
                    CBW(null, res);
                }
            });
        },
        function(res) {
            rspObj.result.content_id = res.result.node_id;
            rspObj.result.versionKey = res.result.versionKey;
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}


function publishContentAPI(req, response) {

    var data = {};
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;
    async.waterfall([

        function(CBW) {
            ekStepUtil.publishContent(data.contentId, function(err, res) {
                //After check response, we perform other operation
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    rspObj.errCode = contentMessage.PUBLISH.FAILED_CODE;
                    rspObj.errMsg = contentMessage.PUBLISH.FAILED_MESSAGE;
                    rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
                    var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500;
                    return response.status(httpStatus).send(respUtil.errorResponse(rspObj));
                } else {
                    CBW(null, res);
                }
            });
        },
        function(res) {
            rspObj.result.content_id = res.result.node_id;
            rspObj.result.versionKey = res.result.versionKey;
            rspObj.result.publishStatus = res.result.publishStatus;
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function getContentAPI(req, response) {

    var data = {};
    data.body = req.body;
    data.contentId = req.params.contentId;
    if (!data.contentId) {
        rspObj.errCode = contentMessage.GET.FAILED_CODE;
        rspObj.errMsg = contentMessage.GET.FAILED_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        response.status(400).send(respUtil.errorResponse(rspObj));
    }

    var rspObj = req.rspObj;
    async.waterfall([

        function(CBW) {
            ekStepUtil.getContent(data.contentId, function(err, res) {
                //After check response, we perform other operation
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    rspObj.errCode = contentMessage.GET.FAILED_CODE;
                    rspObj.errMsg = contentMessage.GET.FAILED_MESSAGE;
                    rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
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
}

function getMyContentAPI(req, response) {

    var request = {
        "filters": {
            // "createdBy": req.userId  
            "createdBy": req.params.createdBy,
            "contentType": getContentTypeForContent()
        }

    };
    req.body.request = request;
    var ekStepReqData = { request: request };
    var rspObj = req.rspObj;
    async.waterfall([

        function(CBW) {
            ekStepUtil.searchContent(ekStepReqData, function(err, res) {

                if (err || res.responseCode !== responseCode.SUCCESS) {
                    rspObj.errCode = contentMessage.GET_MY.FAILED_CODE;
                    rspObj.errMsg = contentMessage.GET_MY.FAILED_MESSAGE;
                    rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
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
}


module.exports.searchContentAPI = searchContentAPI;
module.exports.createContentAPI = createContentAPI;
module.exports.updateContentAPI = updateContentAPI;
module.exports.uploadContentAPI = uploadContentAPI;
module.exports.reviewContentAPI = reviewContentAPI;
module.exports.publishContentAPI = publishContentAPI;
module.exports.getContentAPI = getContentAPI;
module.exports.getMyContentAPI = getMyContentAPI;
