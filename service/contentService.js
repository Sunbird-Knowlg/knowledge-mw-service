/**
 * @name : contentService.js
 * @description :: Responsible for handle content service
 * @author      :: Anuj Gupta
 */

var async = require('async');
var multiparty = require('multiparty');
var fs = require('fs');
var randomString = require('randomstring');
var path = require('path');
var ekStepUtil = require('sb-ekstep-util');
var respUtil = require('response_util');
var configUtil = require('sb-config-util');
var LOG = require('sb_logger_util')
var validatorUtil = require('sb_req_validator_util');

var contentModel = require('../models/contentModel').CONTENT;
var messageUtils = require('./messageUtil');
var utilsService = require('../service/utilsService');

var filename = path.basename(__filename);
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

function checkHealth(req, response) {
    return response.status(200).send("ok");   
}


function searchContentAPI(req, response) {

    var data = req.body;
    var rspObj = req.rspObj;

    if (!data.request || !data.request.filters) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "searchContentAPI", "Error due to required params are missing", data.request));
        rspObj.errCode = contentMessage.SEARCH.MISSING_CODE;
        rspObj.errMsg = contentMessage.SEARCH.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    if (!data.request.filters.contentType && !data.request.filters.mimeType && !data.request.filters.identifier) {
        data.request.filters.contentType = getContentTypeForContent();
    }
    //    if(!data.request.filters.mimeType) {
    //        data.request.filters.mimeType = getMimeTypeForContent();
    //    }

    var ekStepReqData = { request: data.request };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "searchContentAPI", "Request to ekstep for search the content", ekStepReqData));
            ekStepUtil.searchContent(ekStepReqData, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "searchContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.SEARCH.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.SEARCH.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "searchContentAPI", "Content searched successfully, We got " +rspObj.result.count+ " results", {contentCount: rspObj.result.count}));
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
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "createContentAPI", "Error due to required params are missing", data.request));
        rspObj.errCode = contentMessage.CREATE.MISSING_CODE;
        rspObj.errMsg = contentMessage.CREATE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    //Tranform request for Ekstep
    data.request.content.code = getCode();
    data.request.content.createdFor = configUtil.getConfig('CREATED_FOR');
    data.request.content.channelId = configUtil.getConfig('CONTENT_CHANNEL');
    var ekStepReqData = { request: data.request };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "createContentAPI", "Request to ekstep for create the content", ekStepReqData));
            ekStepUtil.createContent(ekStepReqData, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "createContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.CREATE.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.CREATE.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "createContentAPI", "Sending response back to user", rspObj));
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
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "updateContentAPI", "Error due to required params are missing", data.request));
        rspObj.errCode = contentMessage.UPDATE.MISSING_CODE;
        rspObj.errMsg = contentMessage.UPDATE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    async.waterfall([

        function(CBW) {
            var qs = { mode: "edit" };
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "updateContentAPI", "Request to ekstep for get latest version key", {contentId : data.contentId, query : qs}));
            ekStepUtil.getContentUsingQuery(data.contentId, qs, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "updateContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPDATE.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPDATE.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "updateContentAPI", "Request to ekstep for update the course", ekStepReqData));
            ekStepUtil.updateContent(ekStepReqData, data.contentId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "updateContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPDATE.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPDATE.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "updateContentAPI", "Sending response back to user", rspObj));
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
            LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "uploadContentAPI", "Error due to upload files are missing", {contentId : data.contentId, files : files}));
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
                LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "uploadContentAPI", "Request to ekstep for upload the content file", {contentId : data.contentId}));
                ekStepUtil.uploadContent(formData, data.contentId, function(err, res) {
                    if (err || res.responseCode !== responseCode.SUCCESS) {
                        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "uploadContentAPI", "Getting error from ekstep", res));
                        rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPLOAD.FAILED_CODE;
                        rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPLOAD.FAILED_MESSAGE;
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
                LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "uploadContentAPI", "Sending response back to user", rspObj));
                var modifyRsp = respUtil.successResponse(rspObj);
                modifyRsp.success = true;
                return response.status(200).send(modifyRsp);
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "reviewContentAPI", "Request to ekstep for review the content", {req: ekStepReqData, contentId: data.contentId}));
            ekStepUtil.reviewContent(ekStepReqData, data.contentId, function(err, res) {
                //After check response, we perform other operation
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "reviewContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.REVIEW.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.REVIEW.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "reviewContentAPI", "Sending response back to user", rspObj));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}


function publishContentAPI(req, response) {

    var data = req.body;
    var rspObj = req.rspObj;
    data.contentId = req.params.contentId;
    var ekStepReqData = { request: data.request };

    if (!data.request || !data.request.content || !data.request.content.lastPublishedBy) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "publishContentAPI", "Error due to required params are missing", data.request));
        rspObj.errCode = contentMessage.PUBLISH.MISSING_CODE;
        rspObj.errMsg = contentMessage.PUBLISH.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "publishContentAPI", "Request to ekstep for published the content", {contentId: data.contentId, reqData: ekStepReqData}));
            ekStepUtil.publishContent(ekStepReqData, data.contentId, function(err, res) {
                //After check response, we perform other operation
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "publishContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.PUBLISH.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.PUBLISH.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "publishContentAPI", "Sending response back to user", rspObj));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function getContentAPI(req, response) {

    var data = {};
    data.body = req.body;
    data.contentId = req.params.contentId;
    data.queryParams = req.query;
    if (!data.contentId) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getContentAPI", "Error due to required params are missing", {contentId: data.contentId}));
        rspObj.errCode = contentMessage.GET.FAILED_CODE;
        rspObj.errMsg = contentMessage.GET.FAILED_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    var rspObj = req.rspObj;
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getContentAPI", "Request to ekstep for get content meta data", {contentId: data.contentId, qs: data.queryParams}));
            ekStepUtil.getContentUsingQuery(data.contentId, data.queryParams, function(err, res) {
                //After check response, we perform other operation
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getContentAPI", "Sending response back to user"));
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getMyContentAPI", "Request to ekstep for get user content", ekStepReqData));
            ekStepUtil.searchContent(ekStepReqData, function(err, res) {

                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getMyContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET_MY.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET_MY.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getMyContentAPI", "My Content searched successfully, We got " +rspObj.result.count+ " results", {courseCount: rspObj.result.count}));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function retireContentAPI(req, response) {

    var data = {};
    data.body = req.body;
    data.contentId = req.params.contentId;
    data.queryParams = req.query;
    if (!data.contentId) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "retireContentAPI", "Error due to required params are missing", {contentId: data.contentId}));
        rspObj.errCode = contentMessage.GET.FAILED_CODE;
        rspObj.errMsg = contentMessage.GET.FAILED_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    var rspObj = req.rspObj;
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "retireContentAPI", "Request to ekstep for get content meta data", {contentId: data.contentId}));
            ekStepUtil.retireContent(data.contentId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "retireContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "retireContentAPI", "Sending response back to user"));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function rejectContentAPI(req, response) {

    var data = {
        body: req.body
    };
    data.contentId = req.params.contentId;
    var ekStepReqData = { request: data.request };
    var rspObj = req.rspObj;;
    if (!data.contentId) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "rejectContentAPI", "Error due to required params are missing", {contentId: data.contentId}));
        rspObj.errCode = contentMessage.GET.FAILED_CODE;
        rspObj.errMsg = contentMessage.GET.FAILED_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    var rspObj = req.rspObj;
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "rejectContentAPI", "Request to ekstep for get content meta data", {contentId: data.contentId}));
            ekStepUtil.rejectContent(ekStepReqData, data.contentId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "rejectContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.GET.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.GET.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "rejectContentAPI", "Sending response back to user"));
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
module.exports.checkHealth = checkHealth;
module.exports.retireContentAPI = retireContentAPI;
module.exports.rejectContentAPI = rejectContentAPI;