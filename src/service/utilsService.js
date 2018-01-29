/**
 * @name : utilsService.js
 * @description :: Responsible for handle utility function
 * @author      :: Anuj Gupta
 */

const API_CONFIG = require('../config/telemetryEventConfig.json').API

/**
 * this function helps to create apiId for error and success responseresponse
 * @param {String} path
 * @returns {getAppIDForRESP.appId|String}
 */
function getAppIDForRESP (path) {
  var arr = path.split(':')[0].split('/').filter(function (n) {
    return n !== ''
  })
  var appId = 'api.' + arr[arr.length - 2] + '.' + arr[arr.length - 1]
  return appId
}

function getLoggerData (rspObj, level, file, method, message, data, stacktrace) {
  var newDataObj = {}
  if (data && data.headers && data.headers.telemetryData) {
    newDataObj = JSON.parse(JSON.stringify(data))
    delete newDataObj.headers['telemetryData']
  } else {
    newDataObj = data
  }
  var dataObj = {
    'eid': 'BE_LOG',
    'ets': Date.now(),
    'ver': '1.0',
    'mid': rspObj.msgid,
    'context': {
      'pdata': {
        'id': rspObj.apiId,
        'ver': rspObj.apiVersion
      }
    },
    'edata': {
      'eks': {
        'level': level,
        'class': file,
        'method': method,
        'message': message,
        'data': newDataObj,
        'stacktrace': stacktrace
      }
    }
  }

  return dataObj
}

function getPerfLoggerData (rspObj, level, file, method, message, data, stacktrace) {
  var dataObj = {
    'eid': 'PERF_LOG',
    'ets': Date.now(),
    'ver': '1.0',
    'mid': rspObj.msgid,
    'context': {
      'pdata': {
        'id': rspObj.apiId,
        'ver': rspObj.apiVersion
      }
    },
    'edata': {
      'eks': {
        'level': level,
        'class': file,
        'method': method,
        'message': message,
        'data': data,
        'stacktrace': stacktrace
      }
    }
  }

  return dataObj
}

/**
 * This function is used to params data for log event
 * @param {*} data
 */
function getParamsDataForLogEvent (data) {
  const url = getApiUrl(data.path)
  const params = [
    {'rid': data.msgid},
    {'title': API_CONFIG[url] && API_CONFIG[url].title},
    {'category': API_CONFIG[url] && API_CONFIG[url].category},
    {'url': url},
    {'method': data.method}
  ]
  return params
}

/**
 * This function is used to get route of a API
 * @param {String} url
 */
function getApiUrl (url) {
  if (!url) {
    return ''
  }
  const uriArray = url.split('/:')
  const uriArray1 = uriArray[0].split('/')
  const mainUrl = uriArray1.splice(2, uriArray1.length)
  return mainUrl.join('/')
}

/**
 * This function is used to get context data for telemetry
 * @param {Object} req
 */
function getTelemetryContextData (req) {
  const url = getApiUrl(req.body.path)
  var context = {
    channel: req.headers['x-channel-id'],
    env: API_CONFIG[url] && API_CONFIG[url].env
  }
  return context
}

/**
 * This function is used to update context data for telemetry
 * @param {Object} req
 */
function updateContextData (oldData, newData) {
  let contextData = {}
  contextData.channel = newData.channel || oldData.channel
  contextData.env = newData.env || oldData.env
  contextData.cdata = newData.cdata || oldData.cdata
  contextData.rollup = newData.rollup || oldData.rollup
  return JSON.parse(JSON.stringify(contextData))
}

/**
 * This function is used to get actor data for telemetry
 * @param {Object} req
 */
function getTelemetryActorData (req) {
  var actor = {}
  if (req.rspObj && req.rspObj.userId) {
    actor.id = req.rspObj.userId
    actor.type = 'user'
  } else {
    actor.id = req.headers['x-consumer-id']
    actor.type = req.headers['x-consumer-username']
  }
  return actor
}

/**
 * Return object data for telemetry envelop
 */
function getObjectData (id, type, ver, rollup) {
  return {
    id: id,
    type: type,
    ver: ver,
    rollup: rollup
  }
}

module.exports.getLoggerData = getLoggerData
module.exports.getPerfLoggerData = getPerfLoggerData
module.exports.getAppIDForRESP = getAppIDForRESP
module.exports.getParamsDataForLogEvent = getParamsDataForLogEvent
module.exports.getTelemetryContextData = getTelemetryContextData
module.exports.getTelemetryActorData = getTelemetryActorData
module.exports.getObjectData = getObjectData
module.exports.updateContextData = updateContextData
