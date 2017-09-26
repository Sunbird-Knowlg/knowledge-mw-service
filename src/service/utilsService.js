/**
 * @name : utilsService.js
 * @description :: Responsible for handle utility function 
 * @author      :: Anuj Gupta
 */

var path = require('path');

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

function getPerfLoggerData(rspObj, level, file, method, message, data, stacktrace) {

    var data = {
        "eid": "PERF_LOG",
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

module.exports.getLoggerData = getLoggerData;
module.exports.getPerfLoggerData = getPerfLoggerData;
module.exports.getAppIDForRESP = getAppIDForRESP;