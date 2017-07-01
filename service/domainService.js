/**
 * @file  : domainService.js
 * @author: Anuj Gupta
 * @desc  : controller file for handle domain and concepts. 
 */

var async = require('async');
var messageUtils = require('./messageUtil');
var respUtil = require('response_util');
var ekStepUtil = require('sb-ekstep-util');

var domainMessage = messageUtils.DOMAIN;
var responseCode = messageUtils.RESPONSE_CODE;

/**
 * We take the node id from params and fetch detail of id from node model, and return note data.
 * @param {Object} req
 * @param {Object} response
 */
function getDomainsAPI(req, response) {

    var data = {};
    var rspObj = req.rspObj;
    data.body = req.body;
    
    async.waterfall([

        function(CBW) {
            ekStepUtil.getDomains(function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
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
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}


function getDomainAPI(req, response) {
    
    var data = {};
    var rspObj = req.rspObj;

    data.domainId = req.params.domainId;

    if (!data.domainId) {
        rspObj.errCode = domainMessage.GET_DOMAIN_BY_ID.MISSING_CODE;
        rspObj.errMsg = domainMessage.GET_DOMAIN_BY_ID.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    async.waterfall([

        function(CBW) {
            ekStepUtil.getDomainById(data.domainId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
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
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function getObjectsAPI(req, response) {
    
    var data = {};
    var rspObj = req.rspObj;
    data.domainId = req.params.domainId;
    data.objectType = req.params.objectType;

    if (!data.domainId || !data.objectType) {
        rspObj.errCode = domainMessage.GET_OBJECTS.MISSING_CODE;
        rspObj.errMsg = domainMessage.GET_OBJECTS.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    async.waterfall([

        function(CBW) {
            ekStepUtil.getObjects(data.domainId, data.objectType, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
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
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function getObjectAPI(req, response) {
    
    var data = {};
    var rspObj = req.rspObj;

    data.domainId = req.params.domainId;
    data.objectType = req.params.objectType;
    data.objectId = req.params.objectId;

    if (!data.domainId || !data.objectType || !data.objectId) {
        rspObj.errCode = domainMessage.GET_OBJECT_BY_ID.MISSING_CODE;
        rspObj.errMsg = domainMessage.GET_OBJECT_BY_ID.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    async.waterfall([

        function(CBW) {
            ekStepUtil.getObjectById(data.domainId, data.objectType, data.objectId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
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
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function getConceptByIdAPI(req, response) {
    
    var data = {};
    var rspObj = req.rspObj;
    data.conceptId = req.params.conceptId;

    if (!data.conceptId) {
        rspObj.errCode = domainMessage.GET_OBJECTS.MISSING_CODE;
        rspObj.errMsg = domainMessage.GET_OBJECTS.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    async.waterfall([

        function(CBW) {
            ekStepUtil.getConceptById(data.conceptId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
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
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function searchObjectTypeAPI(req, response) {
    
    var rspObj = req.rspObj;
    var data = req.body;
    data.domainId = req.params.domainId;
    data.objectType = req.params.objectType;
    
    if (!data.domainId || !data.objectType || !data.request || !data.request.search) {
        rspObj.errCode = domainMessage.SEARCH_OBJECT_TYPE.MISSING_CODE;
        rspObj.errMsg = domainMessage.SEARCH_OBJECT_TYPE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    var ekStepReqData = { request: data.request };
    
    async.waterfall([

        function(CBW) {
            ekStepUtil.searchObjectsType(ekStepReqData, data.domainId, data.objectType, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
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
            rspObj.result = res.result;
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function createObjectTypeAPI(req, response) {
    
    var rspObj = req.rspObj;

    var data = req.body;
    data.domainId = req.params.domainId;
    data.objectType = req.params.objectType;

    if (!data.domainId || !data.objectType  || !data.request || !data.request.object) {
        rspObj.errCode = domainMessage.CREATE_OBJECT_TYPE.MISSING_CODE;
        rspObj.errMsg = domainMessage.CREATE_OBJECT_TYPE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    var ekStepReqData = { request: data.request };
    
    async.waterfall([

        function(CBW) {
            ekStepUtil.createObjectType(ekStepReqData, data.domainId, data.objectType, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
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
            rspObj.result = res.result;
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function updateObjectTypeAPI(req, response) {
    
    var rspObj = req.rspObj;
    var data = req.body;
    data.domainId = req.params.domainId;
    data.objectType = req.params.objectType;
    data.objectId = req.params.objectId;
    
    if (!data.domainId || !data.objectType || !data.objectId || !data.request || !data.request.object) {
        rspObj.errCode = domainMessage.UPDATE_OBJECT_TYPE.MISSING_CODE;
        rspObj.errMsg = domainMessage.UPDATE_OBJECT_TYPE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    var ekStepReqData = { request: data.request };
    
    async.waterfall([

        function(CBW) {
            ekStepUtil.updateObjectType(ekStepReqData, data.domainId, data.objectType, data.objectId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
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
            rspObj.result = res.result;
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

function retireObjectTypeAPI(req, response) {
    
    var rspObj = req.rspObj;
    var data = req.body;
    data.domainId = req.params.domainId;
    data.objectType = req.params.objectType;
    data.objectId = req.params.objectId;

    if (!data.domainId || !data.objectType || !data.objectId) {
        rspObj.errCode = domainMessage.RETIRE_OBJECT_TYPE.MISSING_CODE;
        rspObj.errMsg = domainMessage.RETIRE_OBJECT_TYPE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }
    
    var ekStepReqData = { };
    
    async.waterfall([

        function(CBW) {
            ekStepUtil.retireObjectType(ekStepReqData, data.domainId, data.objectType, data.objectId, function(err, res) {
                if (err || res.responseCode !== responseCode.SUCCESS) {
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
            rspObj.result = res.result;
            return response.status(200).send(respUtil.successResponse(rspObj));
        }
    ]);
}

module.exports.getDomainsAPI = getDomainsAPI;
module.exports.getDomainAPI = getDomainAPI;
module.exports.getObjectsAPI = getObjectsAPI;
module.exports.getObjectAPI = getObjectAPI;
module.exports.getConceptByIdAPI = getConceptByIdAPI;
module.exports.searchObjectTypeAPI = searchObjectTypeAPI;
module.exports.createObjectTypeAPI = createObjectTypeAPI;
module.exports.updateObjectTypeAPI = updateObjectTypeAPI;
module.exports.retireObjectTypeAPI = retireObjectTypeAPI;
