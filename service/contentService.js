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
var LOG = require('sb_logger_util');
var validatorUtil = require('sb_req_validator_util');

var contentModel = require('../models/contentModel').CONTENT;
var messageUtils = require('./messageUtil');
var utilsService = require('../service/utilsService');
var emailService = require('./emailService');
var mongoConnection = require('../mongoConnection');

var filename = path.basename(__filename);
var contentMessage = messageUtils.CONTENT;
var compositeMessage = messageUtils.COMPOSITE;
var responseCode = messageUtils.RESPONSE_CODE;
var hcMessages = messageUtils.HEALTH_CHECK;

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

function getChecksObj(name, healthy, err, errMsg) {
    return {
        name: name,
        healthy: healthy,
        err: err,
        errmsg: errMsg
    }
};

function getHealthCheckResp(rsp, healthy, checksArrayObj) {
    delete rsp.responseCode;
    rsp.result = {}
    rsp.result.name = messageUtils.SERVICE.NAME;
    rsp.result.version = messageUtils.API_VERSION.V1;
    rsp.result.healthy = healthy;
    rsp.result.check = checksArrayObj;
    return rsp;
}

function checkHealth(req, response) {

    var rspObj = req.rspObj;
    var checksArrayObj = [];
    var isEkStepHealthy, isLSHealthy, isDbConnected;
    var csApiStart = Date.now();
    async.parallel([
        function(CB) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "checkHealth", "Call to ekstep for health check"));
            var apiCallStart = Date.now();
            ekStepUtil.ekStepHealthCheck(function(err, res) {
                LOG.info(utilsService.getPerfLoggerData(rspObj, "INFO", filename, "checkHealth", "Time taken by ekstep health api in ms", {timeInMs: Date.now() - apiCallStart}));
                if(res && res.result && res.result.healthy) {
                    LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "checkHealth", "Ekstep api is healty"));
                    isEkStepHealthy = true;
                    checksArrayObj.push(getChecksObj(hcMessages.EK_STEP.NAME, isEkStepHealthy, "", ""));
                } else {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "checkHealth", "Ekstep api is not healty"));
                    isEkStepHealthy = false;
                    checksArrayObj.push(getChecksObj(hcMessages.EK_STEP.NAME, isEkStepHealthy, hcMessages.EK_STEP.FAILED_CODE, hcMessages.EK_STEP.FAILED_MESSAGE));
                }
                CB();
            })
        },
        function(CB) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "checkHealth", "Call to learner service for health check"));
            var apiCallStart = Date.now();
            ekStepUtil.leanerServiceHealthCheck(function(err, res) {
                LOG.info(utilsService.getPerfLoggerData(rspObj, "INFO", filename, "checkHealth", "Time taken by learner service health api in ms", {timeInMs: Date.now() - apiCallStart}));
                if(res && res.result && res.result.healthy) {
                    LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "checkHealth", "Learner service api is healty"));
                    isLSHealthy = true;
                    checksArrayObj.push(getChecksObj(hcMessages.LEARNER_SERVICE.NAME, isLSHealthy, "", ""));
                } else {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "checkHealth", "Learner service api is not healty"));
                    isLSHealthy = false;
                    checksArrayObj.push(getChecksObj(hcMessages.LEARNER_SERVICE.NAME, isLSHealthy, hcMessages.LEARNER_SERVICE.FAILED_CODE, hcMessages.LEARNER_SERVICE.FAILED_MESSAGE));
                }
                CB();
            })
        },
        function(CB) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "checkHealth", "Check mongo db connection"));
            if(mongoConnection.getConnectionStatus()) {
                LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "checkHealth", "Mongo Db connected"));
                isDbConnected = true;
                checksArrayObj.push(getChecksObj(hcMessages.MONGODB_CONNECTION.NAME, isDbConnected, "", ""));
            } else {
                LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "checkHealth", "Mongo Db is not connected"));
                isDbConnected = false;
                checksArrayObj.push(getChecksObj(hcMessages.MONGODB_CONNECTION.NAME, isDbConnected, hcMessages.MONGODB_CONNECTION.FAILED_CODE, hcMessages.MONGODB_CONNECTION.FAILED_MESSAGE));
            }
            CB();
        },
    ], function() {
        LOG.info(utilsService.getPerfLoggerData(rspObj, "INFO", filename, "checkHealth", "Time taken by content service health api in ms", {timeInMs: Date.now() - csApiStart}));
        if(isEkStepHealthy && isLSHealthy && isDbConnected) {
            var rsp = respUtil.successResponse(rspObj);
            return response.status(200).send(getHealthCheckResp(rsp, true, checksArrayObj));
        } else {
            var rsp = respUtil.successResponse(rspObj);
            return response.status(500).send(getHealthCheckResp(rsp, false, checksArrayObj));
        }
    });
}

function searchAPI(req, response) {
    return search(compositeMessage.CONTENT_TYPE, req, response);
}

function searchContentAPI(req, response) {
    return search(getContentTypeForContent(), req, response);
}

function logs(isPLogs, startTime, rspObj, level, file, method, message, data, stacktrace) {
    if(isPLogs)
        LOG.info(utilsService.getPerfLoggerData(rspObj, "INFO", file, method, "Time taken in ms", {timeInMs: Date.now() - csApiStart}));


}

function search(defaultContentTypes, req, response) {

    var data = req.body;
    var rspObj = req.rspObj;

    if (!data.request || !data.request.filters) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "searchContentAPI", "Error due to required params are missing", data.request));
        
        rspObj.errCode = contentMessage.SEARCH.MISSING_CODE;
        rspObj.errMsg = contentMessage.SEARCH.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    if (!data.request.filters) {
        data.request.filters.contentType = defaultContentTypes;
    }
    //    if(!data.request.filters.mimeType) {
    //        data.request.filters.mimeType = getMimeTypeForContent();
    //    }

    var ekStepReqData = {
        request: data.request
    };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "searchContentAPI", "Request to ekstep for search the content", {
                body : ekStepReqData, 
                headers: req.headers
            }));
            ekStepUtil.searchContent(ekStepReqData, req.headers, function(err, res) {
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "searchContentAPI", "Content searched successfully, We got " + rspObj.result.count + " results", {
                contentCount: rspObj.result.count
            }));
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

    //Transform request for Ek step
    data.request.content.code = getCode();
    var ekStepReqData = {
        request: data.request
    };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "createContentAPI", "Request to ekstep for create the content", {
                body : ekStepReqData, 
                headers: req.headers
            }));
            ekStepUtil.createContent(ekStepReqData, req.headers, function(err, res) {
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
            var qs = {
                mode: "edit"
            };
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "updateContentAPI", "Request to ekstep for get latest version key", {
                contentId: data.contentId,
                query: qs,
                headers: req.headers
            }));
            ekStepUtil.getContentUsingQuery(data.contentId, qs, req.headers, function(err, res) {
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
            var ekStepReqData = {
                request: data.request
            };
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "updateContentAPI", "Request to ekstep for update the content", {
                body : ekStepReqData, 
                headers: req.headers
            }));
            ekStepUtil.updateContent(ekStepReqData, data.contentId, req.headers, function(err, res) {
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
    data.queryParams = req.query;
    var rspObj = req.rspObj;
    
    if(!data.queryParams.fileUrl) {
        var form = new multiparty.Form();

        form.parse(req, function(err, fields, files) {
        if (err || (files && Object.keys(files).length === 0)) {
                LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "uploadContentAPI", "Error due to upload files are missing", {
                    contentId: data.contentId,
                    files: files
                }));
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
                    LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "uploadContentAPI", "Request to ekstep for upload the content file", {
                        contentId: data.contentId,
                        headers: req.headers
                    }));
                    delete req.headers['content-type'];
                    ekStepUtil.uploadContent(formData, data.contentId, req.headers, function(err, res) {
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
    } else {
        var queryString = {fileUrl : data.queryParams.fileUrl};
        async.waterfall([

            function(CBW) {
                LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "uploadContentAPI", "Request to ekstep for upload the content file", {
                    contentId: data.contentId,
                    headers: req.headers
                }));
                delete req.headers['content-type'];
                ekStepUtil.uploadContentWithFileUrl(data.contentId, queryString, req.headers, function(err, res) {
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
    }
}

function reviewContentAPI(req, response) {

    var data = {
        body: req.body
    };
    data.contentId = req.params.contentId;
    var ekStepReqData = {
        request: data.request
    };
    var rspObj = req.rspObj;

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "reviewContentAPI", "Request to ekstep for review the content", {
                req: ekStepReqData,
                contentId: data.contentId,
                headers: req.headers
            }));
            ekStepUtil.reviewContent(ekStepReqData, data.contentId, req.headers, function(err, res) {
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
    var ekStepReqData = {
        request: data.request
    };

    if (!data.request || !data.request.content || !data.request.content.lastPublishedBy) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "publishContentAPI", "Error due to required params are missing", data.request));
        rspObj.errCode = contentMessage.PUBLISH.MISSING_CODE;
        rspObj.errMsg = contentMessage.PUBLISH.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "publishContentAPI", "Request to ekstep for published the content", {
                contentId: data.contentId,
                reqData: ekStepReqData,
                headers: req.headers
            }));
            ekStepUtil.publishContent(ekStepReqData, data.contentId, req.headers, function(err, res) {
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
    var rspObj = req.rspObj;
    
    if (!data.contentId) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getContentAPI", "Error due to required params are missing", {
            contentId: data.contentId
        }));
        rspObj.errCode = contentMessage.GET.MISSING_CODE;
        rspObj.errMsg = contentMessage.GET.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getContentAPI", "Request to ekstep for get content meta data", {
                contentId: data.contentId,
                qs: data.queryParams, 
                headers: req.headers
            }));
            ekStepUtil.getContentUsingQuery(data.contentId, data.queryParams, req.headers, function(err, res) {
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
    var ekStepReqData = {
        request: request
    };
    var rspObj = req.rspObj;
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getMyContentAPI", "Request to ekstep for get user content", {
                body : ekStepReqData, 
                headers: req.headers
            }));
            ekStepUtil.searchContent(ekStepReqData, req.headers, function(err, res) {

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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getMyContentAPI", "My Content searched successfully, We got " + rspObj.result.count + " results", {
                courseCount: rspObj.result.count
            }));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function retireContentAPI(req, response) {

    var data = req.body;
    var rspObj = req.rspObj;
    var failedContent = [];
    var errCode, errMsg, respCode, httpStatus;

    if (!data.request || !data.request.contentIds) {
        //prepare
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "retireContentAPI", "Error due to required params are missing", data.request));
        rspObj.errCode = contentMessage.CREATE.MISSING_CODE;
        rspObj.errMsg = contentMessage.CREATE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    async.waterfall([

        function(CBW) {
            async.each(data.request.contentIds, function(contentId, CBE) {
                LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "retireContentAPI", "Request to ekstep for retire content meta data", {
                    contentId: contentId,
                    headers: req.headers
                }));
                ekStepUtil.retireContent(contentId, req.headers, function(err, res) {
                    if (err || res.responseCode !== responseCode.SUCCESS) {
                        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "retireContentAPI", "Getting error from ekstep", res));
                        errCode = res && res.params ? res.params.err : contentMessage.GET_MY.FAILED_CODE;
                        errMsg = res && res.params ? res.params.errmsg : contentMessage.GET_MY.FAILED_MESSAGE;
                        respCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
                        httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500;
                        failedContent.push({contentId : contentId, errCode : errCode, errMsg : errMsg});
                    }
                    CBE(null, null);
                });
            }, function() {
                if(failedContent.length > 0) {
                    rspObj.errCode = errCode;
                    rspObj.errMsg = errMsg;
                    rspObj.responseCode = respCode;
                    rspObj.result = failedContent;
                    return response.status(httpStatus).send(respUtil.errorResponse(rspObj));
                } else {
                    CBW();
                }
            });
        },
        function() {
            rspObj.result = failedContent;
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
    var rspObj = req.rspObj;
    if (!data.contentId) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "rejectContentAPI", "Error due to required params are missing", {
            contentId: data.contentId
        }));
        rspObj.errCode = contentMessage.REJECT.MISSING_CODE;
        rspObj.errMsg = contentMessage.REJECT.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    var ekStepReqData = {
        request: data.request
    };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "rejectContentAPI", "Request to ekstep for reject content meta data", {
                contentId: data.contentId,
                headers: req.headers
            }));
            ekStepUtil.rejectContent(ekStepReqData, data.contentId, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "rejectContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.REJECT.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.REJECT.FAILED_MESSAGE;
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

function flagContentAPI(req, response) {

    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;
    if (!data.contentId || !data.request || !data.request.flaggedBy || !data.request.versionKey) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "flagContentAPI", "Error due to required params are missing", {
            contentId: data.contentId
        }));
        rspObj.errCode = contentMessage.FLAG.MISSING_CODE;
        rspObj.errMsg = contentMessage.FLAG.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    var ekStepReqData = {
        request: data.request
    };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "flagContentAPI", "Request to ekstep for flag the content meta data", {
                contentId: data.contentId,
                body: ekStepReqData,
                headers: req.headers
            }));
            ekStepUtil.flagContent(ekStepReqData, data.contentId, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "flagContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.FLAG.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.FLAG.FAILED_MESSAGE;
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
            emailService.createFlagContentEmail(req, function(){ });
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "flagContentAPI", "Sending response back to user"));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function acceptFlagContentAPI(req, response) {

    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;
    if (!data.contentId || !data.request || !data.request.versionKey) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "acceptFlagContentAPI", "Error due to required params are missing", {
            contentId: data.contentId
        }));
        rspObj.errCode = contentMessage.ACCEPT_FLAG.MISSING_CODE;
        rspObj.errMsg = contentMessage.ACCEPT_FLAG.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    var ekStepReqData = {
        request: data.request
    };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "acceptFlagContentAPI", "Request to ekstep for accept flag", {
                contentId: data.contentId,
                body: ekStepReqData,
                headers: req.headers
            }));
            ekStepUtil.acceptFlagContent(ekStepReqData, data.contentId, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "acceptFlagContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.ACCEPT_FLAG.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.ACCEPT_FLAG.FAILED_MESSAGE;
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
            emailService.acceptFlagContentEmail(req, function(){ });
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "acceptFlagContentAPI", "Sending response back to user"));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function rejectFlagContentAPI(req, response) {

    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;
    if (!data.contentId || !data.request) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "rejectFlagContentAPI", "Error due to required params are missing", {
            contentId: data.contentId
        }));
        rspObj.errCode = contentMessage.REJECT_FLAG.MISSING_CODE;
        rspObj.errMsg = contentMessage.REJECT_FLAG.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    var ekStepReqData = {
        request: data.request
    };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "rejectFlagContentAPI", "Request to ekstep for reject flag", {
                contentId: data.contentId,
                body: ekStepReqData,
                headers: req.headers
            }));
            ekStepUtil.rejectFlagContent(ekStepReqData, data.contentId, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "rejectFlagContentAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.REJECT_FLAG.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.REJECT_FLAG.FAILED_MESSAGE;
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
            emailService.rejectFlagContentEmail(req, function(){ });
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "rejectFlagContentAPI", "Sending response back to user"));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function uploadContentUrlAPI(req, response) {

    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;
    if (!data.contentId || !data.request || !data.request.content || !data.request.content.fileName) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "uploadContentUrlAPI", "Error due to required params are missing", {
            contentId: data.contentId,
            body: data
        }));
        rspObj.errCode = contentMessage.UPLOAD_URL.MISSING_CODE;
        rspObj.errMsg = contentMessage.UPLOAD_URL.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    var ekStepReqData = {
        request: data.request
    };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "uploadContentUrlAPI", "Request to ekstep for get upload content url", {
                contentId: data.contentId,
                body: ekStepReqData,
                headers: req.headers
            }));
            ekStepUtil.uploadContentUrl(ekStepReqData, data.contentId, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "uploadContentUrlAPI", "Getting error from ekstep", res));
                    rspObj.errCode = res && res.params ? res.params.err : contentMessage.UPLOAD_URL.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : contentMessage.UPLOAD_URL.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "uploadContentUrlAPI", "Sending response back to user"));
            var modifyRsp = respUtil.successResponse(rspObj);
            modifyRsp.success = true;
            return response.status(200).send(modifyRsp);
        }
    ]);
}

module.exports.searchAPI = searchAPI;
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
module.exports.flagContentAPI = flagContentAPI;
module.exports.acceptFlagContentAPI = acceptFlagContentAPI;
module.exports.rejectFlagContentAPI = rejectFlagContentAPI;
module.exports.uploadContentUrlAPI = uploadContentUrlAPI;
