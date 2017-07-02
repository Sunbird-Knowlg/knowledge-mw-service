/**
 * @file  : domainService.js
 * @author: Anuj Gupta
 * @desc  : controller file for handle domain and concepts. 
 */

var async = require('async');
var path = require('path');
var respUtil = require('response_util');
var ekStepUtil = require('sb-ekstep-util');
var LOG = require('sb_logger_util');

var messageUtils = require('./messageUtil');
var utilsService = require('../service/utilsService');

var filename = path.basename(__filename);
var domainMessage = messageUtils.DOMAIN;
var responseCode = messageUtils.RESPONSE_CODE;

/**
 * This function helps to get all domain from ekstep
 * @param {Object} req
 * @param {Object} response
 */
function getDomainsAPI(req, response) {

    var data = {};
    var rspObj = req.rspObj;
    data.body = req.body;
    
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getDomainsAPI", "Request to ekstep for get all domains"));
            ekStepUtil.getDomains(function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getDomainsAPI", "Getting error from ekstep", res));
                    rspObj.errCode = domainMessage.GET_DOMAINS.FAILED_CODE;
                    rspObj.errMsg = domainMessage.GET_DOMAINS.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getDomainsAPI", "Sending response back to user"));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

/**
 * This function helps to get domain from ekstep by domainId 
 * @param {Object} req
 * @param {Object} response
 */
function getDomainByIDAPI(req, response) {
    
    var data = {};
    var rspObj = req.rspObj;

    data.domainId = req.params.domainId;

    if (!data.domainId) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getDomainByIDAPI", "Error due to required params are missing", data));
        rspObj.errCode = domainMessage.GET_DOMAIN_BY_ID.MISSING_CODE;
        rspObj.errMsg = domainMessage.GET_DOMAIN_BY_ID.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    async.waterfall([
        
        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getDomainByIDAPI", "Request to ekstep for get domain by id", data));
            ekStepUtil.getDomainById(data.domainId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getDomainByIDAPI", "Getting error from ekstep", res));
                    rspObj.errCode = domainMessage.GET_DOMAIN_BY_ID.FAILED_CODE;
                    rspObj.errMsg = domainMessage.GET_DOMAIN_BY_ID.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getDomainByIDAPI", "Sending response back to user"));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

/**
 * This function helps to get all object of a domain and object type
 * @param {Object} req
 * @param {Object} response
 */
function getObjectTypesAPI(req, response) {
    
    var data = {};
    var rspObj = req.rspObj;
    data.domainId = req.params.domainId;
    data.objectType = req.params.objectType;

    if (!data.domainId || !data.objectType) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getObjectTypesAPI", "Error due to required params are missing", data));
        rspObj.errCode = domainMessage.GET_OBJECTS.MISSING_CODE;
        rspObj.errMsg = domainMessage.GET_OBJECTS.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getObjectTypesAPI", "Request to ekstep for get object type", data));
            ekStepUtil.getObjects(data.domainId, data.objectType, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getObjectTypesAPI", "Getting error from ekstep", res));
                    rspObj.errCode = domainMessage.GET_OBJECTS.FAILED_CODE;
                    rspObj.errMsg = domainMessage.GET_OBJECTS.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getObjectTypesAPI", "Sending response back to user"));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

/**
 * This function helps to get object of a domain, object type and object id
 * @param {Object} req
 * @param {Object} response
 */
function getObjectTypeByIDAPI(req, response) {
    
    var data = {};
    var rspObj = req.rspObj;

    data.domainId = req.params.domainId;
    data.objectType = req.params.objectType;
    data.objectId = req.params.objectId;

    if (!data.domainId || !data.objectType || !data.objectId) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getObjectTypeByIDAPI", "Error due to required params are missing", data));
        rspObj.errCode = domainMessage.GET_OBJECT_BY_ID.MISSING_CODE;
        rspObj.errMsg = domainMessage.GET_OBJECT_BY_ID.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getObjectTypeByIDAPI", "Request to ekstep for get object type using id", data));
            ekStepUtil.getObjectById(data.domainId, data.objectType, data.objectId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getObjectTypeByIDAPI", "Getting error from ekstep", res));
                    rspObj.errCode = domainMessage.GET_OBJECT_BY_ID.FAILED_CODE;
                    rspObj.errMsg = domainMessage.GET_OBJECT_BY_ID.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getObjectTypeByIDAPI", "Sending response back to user"));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

/**
 * This function helps to get concept object by concept id
 * @param {Object} req
 * @param {Object} response
 */
function getConceptByIdAPI(req, response) {
    
    var data = {};
    var rspObj = req.rspObj;
    data.conceptId = req.params.conceptId;

    if (!data.conceptId) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getConceptByIdAPI", "Error due to required params are missing", data));
        rspObj.errCode = domainMessage.GET_OBJECTS.MISSING_CODE;
        rspObj.errMsg = domainMessage.GET_OBJECTS.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getConceptByIdAPI", "Request to ekstep for get concept", data));
            ekStepUtil.getConceptById(data.conceptId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "getConceptByIdAPI", "Getting error from ekstep", res));
                    rspObj.errCode = domainMessage.GET_CONCEPT_BY_ID.FAILED_CODE;
                    rspObj.errMsg = domainMessage.GET_CONCEPT_BY_ID.FAILED_MESSAGE;
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
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "getConceptByIdAPI", "Sending response back to user"));
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

/**
 * This function helps to search object of a domain and object type
 * @param {Object} req
 * @param {Object} response
 */
function searchObjectTypeAPI(req, response) {
    
    var rspObj = req.rspObj;
    var data = req.body;
    data.domainId = req.params.domainId;
    data.objectType = req.params.objectType;
    
    if (!data.domainId || !data.objectType || !data.request || !data.request.search) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "searchObjectTypeAPI", "Error due to required params are missing", data));
        rspObj.errCode = domainMessage.SEARCH_OBJECT_TYPE.MISSING_CODE;
        rspObj.errMsg = domainMessage.SEARCH_OBJECT_TYPE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    var ekStepReqData = { request: data.request };
    
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "searchObjectTypeAPI", "Request to ekstep for search object type", data));
            ekStepUtil.searchObjectsType(ekStepReqData, data.domainId, data.objectType, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "searchObjectTypeAPI", "Getting error from ekstep", res));
                    rspObj.errCode = domainMessage.SEARCH_OBJECT_TYPE.FAILED_CODE;
                    rspObj.errMsg = domainMessage.SEARCH_OBJECT_TYPE.FAILED_MESSAGE;
                    rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
                    var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500;
                    return response.status(httpStatus).send(respUtil.errorResponse(rspObj));
                } else {
                    CBW(null, res);
                }
            });
        },

        function(res) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "searchObjectTypeAPI", "Sending response back to user"));
            rspObj.result = res.result;
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

/**
 * This function helps to create object of a domain and object type
 * @param {Object} req
 * @param {Object} response
 */
function createObjectTypeAPI(req, response) {
    
    var rspObj = req.rspObj;

    var data = req.body;
    data.domainId = req.params.domainId;
    data.objectType = req.params.objectType;

    if (!data.domainId || !data.objectType  || !data.request || !data.request.object) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "createObjectTypeAPI", "Error due to required params are missing", data));
        rspObj.errCode = domainMessage.CREATE_OBJECT_TYPE.MISSING_CODE;
        rspObj.errMsg = domainMessage.CREATE_OBJECT_TYPE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    var ekStepReqData = { request: data.request };
    
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "createObjectTypeAPI", "Request to ekstep for create object type", data));
            ekStepUtil.createObjectType(ekStepReqData, data.domainId, data.objectType, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "createObjectTypeAPI", "Getting error from ekstep", res));
                    rspObj.errCode = domainMessage.CREATE_OBJECT_TYPE.FAILED_CODE;
                    rspObj.errMsg = domainMessage.CREATE_OBJECT_TYPE.FAILED_MESSAGE;
                    rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
                    var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500;
                    return response.status(httpStatus).send(respUtil.errorResponse(rspObj));
                } else {
                    CBW(null, res);
                }
            });
        },

        function(res) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "createObjectTypeAPI", "Sending response back to user"));
            rspObj.result = res.result;
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

/*
 * This function helps to update object of a domain and object type
 * @param {Object} req
 * @param {Object} response
 */
function updateObjectTypeAPI(req, response) {
    
    var rspObj = req.rspObj;
    var data = req.body;
    data.domainId = req.params.domainId;
    data.objectType = req.params.objectType;
    data.objectId = req.params.objectId;
    
    if (!data.domainId || !data.objectType || !data.objectId || !data.request || !data.request.object) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "updateObjectTypeAPI", "Error due to required params are missing", data));
        rspObj.errCode = domainMessage.UPDATE_OBJECT_TYPE.MISSING_CODE;
        rspObj.errMsg = domainMessage.UPDATE_OBJECT_TYPE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    var ekStepReqData = { request: data.request };
    
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "updateObjectTypeAPI", "Request to ekstep for update object type", data));
            ekStepUtil.updateObjectType(ekStepReqData, data.domainId, data.objectType, data.objectId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "updateObjectTypeAPI", "Getting error from ekstep", res));
                    rspObj.errCode = domainMessage.UPDATE_OBJECT_TYPE.FAILED_CODE;
                    rspObj.errMsg = domainMessage.UPDATE_OBJECT_TYPE.FAILED_MESSAGE;
                    rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
                    var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500;
                    return response.status(httpStatus).send(respUtil.errorResponse(rspObj));
                } else {
                    CBW(null, res);
                }
            });
        },

        function(res) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "updateObjectTypeAPI", "Sending response back to user"));
            rspObj.result = res.result;
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

/*
 * This function helps to retire object of a domain and object type
 * @param {Object} req
 * @param {Object} response
 */
function retireObjectTypeAPI(req, response) {
    
    var rspObj = req.rspObj;
    var data = req.body;
    data.domainId = req.params.domainId;
    data.objectType = req.params.objectType;
    data.objectId = req.params.objectId;

    if (!data.domainId || !data.objectType || !data.objectId) {
        LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "retireObjectTypeAPI", "Error due to required params are missing", data));
        rspObj.errCode = domainMessage.RETIRE_OBJECT_TYPE.MISSING_CODE;
        rspObj.errMsg = domainMessage.RETIRE_OBJECT_TYPE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    var ekStepReqData = { };
    
    async.waterfall([

        function(CBW) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "retireObjectTypeAPI", "Request to ekstep for retire object type", data));
            ekStepUtil.retireObjectType(ekStepReqData, data.domainId, data.objectType, data.objectId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
                    LOG.error(utilsService.getLoggerData(rspObj, "ERROR", filename, "retireObjectTypeAPI", "Getting error from ekstep", res));
                    rspObj.errCode = domainMessage.RETIRE_OBJECT_TYPE.FAILED_CODE;
                    rspObj.errMsg = domainMessage.RETIRE_OBJECT_TYPE.FAILED_MESSAGE;
                    rspObj.responseCode = res && res.responseCode ? res.responseCode : responseCode.SERVER_ERROR;
                    var httpStatus = res && res.statusCode >= 100 && res.statusCode < 600 ? res.statusCode : 500;
                    return response.status(httpStatus).send(respUtil.errorResponse(rspObj));
                } else {
                    CBW(null, res);
                }
            });
        },

        function(res) {
            LOG.info(utilsService.getLoggerData(rspObj, "INFO", filename, "retireObjectTypeAPI", "Sending response back to user"));
            rspObj.result = res.result;
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

module.exports.getDomainsAPI = getDomainsAPI;
module.exports.getDomainByIDAPI = getDomainByIDAPI;
module.exports.getObjectTypesAPI = getObjectTypesAPI;
module.exports.getObjectTypeByIDAPI = getObjectTypeByIDAPI;
module.exports.getConceptByIdAPI = getConceptByIdAPI;
module.exports.searchObjectTypeAPI = searchObjectTypeAPI;
module.exports.createObjectTypeAPI = createObjectTypeAPI;
module.exports.updateObjectTypeAPI = updateObjectTypeAPI;
module.exports.retireObjectTypeAPI = retireObjectTypeAPI;
