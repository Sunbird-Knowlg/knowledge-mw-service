/**
 * @name : dialCodeService.js
 * @description :: Responsible for handle dial code service
 * @author      :: Anuj Gupta
 */

var async = require('async');
var path = require('path');
var ekStepUtil = require('sb-ekstep-util');
var respUtil = require('response_util');
var configUtil = require('sb-config-util');
var LOG = require('sb_logger_util');
var validatorUtil = require('sb_req_validator_util');

var messageUtils = require('./messageUtil');
var utilsService = require('../service/utilsService');
var emailService = require('./emailService');

var filename = path.basename(__filename);
var dialCodeMessage = messageUtils.DIALCODE;
var responseCode = messageUtils.RESPONSE_CODE;
var reqMsg = messageUtils.REQUEST;

/**
 * This function helps to generate dialcode
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status 
 */
function generateDialCodeAPI(req, response) {

    var data = req.body,
        rspObj = req.rspObj;

    if (!data.request || !data.request.dialcodes) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "generateDialCodeAPI", "Error due to required params are missing", data.request));
        rspObj.errCode = dialCodeMessage.GENERATE.MISSING_CODE;
        rspObj.errMsg = dialCodeMessage.GENERATE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    //Transform request for Ek step
    var reqData = {
        request: data.request
    };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "generateDialCodeAPI", "Request for create the content", {
                body : reqData, 
                headers: req.headers
            }));
            ekStepUtil.generateDialCode(reqData, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "generateDialCodeAPI", "Getting error", res));
                    rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.GENERATE.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.GENERATE.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "generateDialCodeAPI", "Return response back to user", rspObj));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

/**
 * This function helps to get list of dialcodes
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status 
 */
function dialCodeListAPI(req, response) {

    var data = req.body,
        rspObj = req.rspObj;

    if (!data.request || !data.request.search) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "dialCodeListAPI", "Error due to required params are missing", data.request));
        rspObj.errCode = dialCodeMessage.LIST.MISSING_CODE;
        rspObj.errMsg = dialCodeMessage.LIST.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    //Transform request for Ek step
    var reqData = {
        request: data.request
    };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "dialCodeListAPI", "Request for create the content", {
                body : reqData, 
                headers: req.headers
            }));
            ekStepUtil.dialCodeList(reqData, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "dialCodeListAPI", "Getting error", res));
                    rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.LIST.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.LIST.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "dialCodeListAPI", "Return response back to user", rspObj));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

/**
 * This function helps to update dialcode
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status 
 */
function updateDialCodeAPI(req, response) {

    var data = req.body;
    data.dialCodeId = req.params.dialCodeId;
    var rspObj = req.rspObj;

    if (!data.request || !data.request.dialcode || !data.dialCodeId) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "updateDialCodeAPI", "Error due to required params are missing", data.request));
        rspObj.errCode = dialCodeMessage.UPDATE.MISSING_CODE;
        rspObj.errMsg = dialCodeMessage.UPDATE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    //Transform request for Ek step
    var reqData = {
        request: data.request
    };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "updateDialCodeAPI", "Request for update the content", {
                body : reqData, 
                headers: req.headers
            }));
            ekStepUtil.updateDialCode(reqData, data.dialCodeId, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "updateDialCodeAPI", "Getting error", res));
                    rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.UPDATE.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.UPDATE.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "updateDialCodeAPI", "Return response back to user", rspObj));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

/**
 * This function helps to get dialcode meta
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status 
 */
function getDialCodeAPI(req, response) {

    var data = {};
    data.body = req.body;
    data.dialCodeId = req.params.dialCodeId;
    var rspObj = req.rspObj;
    
    if (!data.dialCodeId) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getDialCodeAPI", "Error due to required params are missing", {
            dialCodeId: data.dialCodeId
        }));
        rspObj.errCode = dialCodeMessage.GET.MISSING_CODE;
        rspObj.errMsg = dialCodeMessage.GET.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getDialCodeAPI", "Request for get dialcode meta data", {
                dialCodeId: data.dialCodeId,
                qs: data.queryParams, 
                headers: req.headers
            }));
            ekStepUtil.getDialCode(data.dialCodeId, req.headers, function(err, res) {
                //After check response, we perform other operation
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getDialCodeAPI", "Getting error", res));
                    rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.GET.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.GET.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getDialCodeAPI", "Sending response back to user"));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

/**
 * This function helps to link the content with dialcode
 * @param {type} req
 * @param {type} response
 * @returns {object} return response object with http status 
 */
function contentLinkDialCodeAPI(req, response) {

    var data = req.body;
    data.contentId = req.params.contentId;
    var rspObj = req.rspObj;

    if (!data.request || !data.request.dialcodes || !data.contentId) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "contentLinkDialCodeAPI", "Error due to required params are missing", data.request));
        rspObj.errCode = dialCodeMessage.CONTENT_LINK.MISSING_CODE;
        rspObj.errMsg = dialCodeMessage.CONTENT_LINK.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    //Transform request for Ek step
    var reqData = {
        request: data.request
    };

    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "contentLinkDialCodeAPI", "Request for link the content", {
                body : reqData, 
                headers: req.headers
            }));
            ekStepUtil.contentLinkDialCode(reqData, data.contentId, req.headers, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "contentLinkDialCodeAPI", "Getting error", res));
                    rspObj.errCode = res && res.params ? res.params.err : dialCodeMessage.CONTENT_LINK.FAILED_CODE;
                    rspObj.errMsg = res && res.params ? res.params.errmsg : dialCodeMessage.CONTENT_LINK.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "contentLinkDialCodeAPI", "Return response back to user", rspObj));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}


module.exports.generateDialCodeAPI = generateDialCodeAPI;
module.exports.dialCodeListAPI = dialCodeListAPI;
module.exports.updateDialCodeAPI = updateDialCodeAPI;
module.exports.getDialCodeAPI = getDialCodeAPI;
module.exports.contentLinkDialCodeAPI = contentLinkDialCodeAPI;
