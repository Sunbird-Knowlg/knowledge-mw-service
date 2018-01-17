 var async = require('async')
 var _ = require('lodash')
 var contentProvider = require('sb_content_provider_util')
 var configUtil = require('sb-config-util')
 var dialcodeMaxCount = configUtil.getConfig('DIALCODE_GENERATE_MAX_COUNT')
 var path = require('path')
 var filename = path.basename(__filename)
 var messageUtils = require('./../messageUtil')
 var responseCode = messageUtils.RESPONSE_CODE
 var LOG = require('sb_logger_util')

// Logic to get the dialcodes for request count

 function DialCodeServiceHelper () {}

 DialCodeServiceHelper.prototype.generateDialcodes = function (req, headers, callback) {
   this.totalCount = req.request.dialcodes.count > dialcodeMaxCount ? dialcodeMaxCount : req.request.dialcodes.count
   var self = this
   this.callApi(req, headers, this.totalCount, function (err, res) {
     if (err || _.indexOf([responseCode.SUCCESS, responseCode.PARTIAL_SUCCESS], res.responseCode) === -1) {
       callback(err, res)
     } else if (_.get(res, 'result.count') === self.totalCount) {
       callback(err, res)
     } else if (_.get(res, 'result.count') < self.totalCount) {
       var apiMaxCount = res.result.count
       var remainingCount = self.totalCount - apiMaxCount
       var totalResCount = res.result.count
       var q = async.queue(function (task, cb) {
         self.callApi(req, headers, task.count, function (err, resData) {
           cb(err, resData)
         })
       }, 10)

       q.drain = function () {
         LOG.info({filename, status: 'processed all the requests count: ' + totalResCount})
         res.result.count = totalResCount
         callback(err, res)
       }

       while (remainingCount > 0) {
         q.push({count: remainingCount}, function (err, respData) {
           if (err || _.indexOf([responseCode.SUCCESS, responseCode.PARTIAL_SUCCESS], res.responseCode) === -1) {
             LOG.error({'err': err, 'response': respData})
           } else {
             totalResCount = totalResCount + respData.result.count
             res.result.dialcodes = _.merge(res.result.dialcodes, respData.result.dialcodes)
           }
         })
         remainingCount = remainingCount - apiMaxCount
       }
     }
   })
 }

 DialCodeServiceHelper.prototype.callApi = function (req, headers, count, callback) {
   var reqData = _.clone(req)
   reqData.request.dialcodes.count = count
   contentProvider.generateDialCode(req, headers, callback)
 }

 module.exports = new DialCodeServiceHelper()
