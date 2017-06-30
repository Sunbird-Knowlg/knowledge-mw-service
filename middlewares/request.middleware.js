var uuidV1 = require('uuid/v1');
var respUtil = require('response_util');
var messageUtil = require('../service/messageUtil');
var mongoConnection = require('../mongoConnection');

var reqMsg = messageUtil.REQUEST;
var responseCode = messageUtil.RESPONSE_CODE;
var apiVersions = messageUtil.API_VERSION;

/**
 * This function helps to validate the request body and create response body
 * this function works as a middleware which called before each api
 * @param {type} req
 * @param {type} res
 * @param {type} next
 * @returns {unresolved}
 */

function createAndValidateRequestBody(req, res, next) {

    req.body.ts = new Date();
    req.body.url = req.url;
    req.body.path = req.route.path;
    req.body.params = req.body.params ? req.body.params : {};
    req.body.params.msgid = req.headers['msgid'] || req.body.params.msgid || uuidV1();
    req.body.params.did = req.headers['did'] || req.body.params.did;
    req.body.params.cid = req.headers['cid'] || req.body.params.cid;
    req.body.params.uid = req.headers['uid'] || req.body.params.uid;
    req.body.params.sid = req.headers['sid'] || req.body.params.sid;

    var rspObj = {
        path: req.body.path,
        apiVersion: apiVersions.V1,
        msgid: req.body.params.msgid,
        result: {}
    };

    //Check consumer id for all api
    if (!req.body.params.cid) {
        rspObj.errCode = reqMsg.PARAMS.MISSING_CID_CODE;
        rspObj.errMsg = reqMsg.PARAMS.MISSING_CID_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return res.status(400).send(respUtil.errorResponse(rspObj));
    }

    req.rspObj = rspObj;
    next();
}

/**
 * This function helps to check the mongodb connection if mongodb not connected we retry.
 * This function works as a middleware which called before each mongodb based api
 * @param {type} req
 * @param {type} res
 * @param {type} next
 * @returns {undefined}
 */

function checkMongooseConnection(req, res, next) {

    var rspObj = req.rspObj;

    var isMongoConnected = mongoConnection.getConnectionStatus();

    if (isMongoConnected) {
        next();
    } else {
        mongoConnection.stablishMongoDBConnection(function (err, isConnected) {
            if (err) {
                rspObj.errCode = reqMsg.DB_ERROR.DB_ERROR_CODE;
                rspObj.errMsg = reqMsg.DB_ERROR.DB_ERROR_MESSAGE;
                rspObj.responseCode = responseCode.SERVER_ERROR;
                return res.status(500).send(respUtil.errorResponse(rspObj));
            } else {
                next();
            }
        });
    }
}

module.exports.createAndValidateRequestBody = createAndValidateRequestBody;
module.exports.checkMongooseConnection = checkMongooseConnection;
