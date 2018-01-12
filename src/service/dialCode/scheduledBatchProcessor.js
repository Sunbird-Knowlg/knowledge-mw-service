var cron = require('node-cron')
var LOG = require('sb_logger_util')
var path = require('path')
var _ = require('lodash')
var filename = path.basename(__filename)
var dbModel = require('./../../utils/cassandraUtil')

var task = null

function addUnproccessedItems () {
  dbModel.instance.dialcode_batch.find({status: 0, $limit: 100}, {allow_filtering: true, raw: true}, function (error, batches) {
    if (error) {
      LOG.error({filename, 'error while getting data from db for scheduled process ': error})
    } else {
      _.forEach(batches, function (batch) {
        global.imageBatchProcess.send({processId: batch.processid.toString()})
      })
    }
  })

  dbModel.instance.dialcode_batch.find({status: 1, $limit: 100}, {allow_filtering: true, raw: true}, function (error, batches) {
    if (error) {
      LOG.error({filename, 'error while getting data from db for scheduled process ': error})
    } else {
      _.forEach(batches, function (batch) {
        global.imageBatchProcess.send({processId: batch.processid.toString()})
      })
    }
  })
}

(function () {
  if (task == null) {
    task = cron.schedule('0 0 * * *', function () {
      addUnproccessedItems()
    })
  }
})()

module.exports = task
