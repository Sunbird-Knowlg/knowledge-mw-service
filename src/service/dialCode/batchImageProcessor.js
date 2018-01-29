var async = require('async')
var LOG = require('sb_logger_util')
var path = require('path')
var zipFolder = require('zip-folder')
var fs = require('fs')
var rimraf = require('rimraf')
var _ = require('lodash')
var dbModel = require('./../../utils/cassandraUtil')
var ImageService = require('./imageService')
var UploadUtil = require('./../../utils/uploadUtil')
var uploadUtil = new UploadUtil()
var filename = path.basename(__filename)
var queue = []
var processStatus = false
var Telemetry = require('sb_telemetry_util')
var telemetry = new Telemetry()

function BatchImageProcessor () {}

BatchImageProcessor.prototype.register = function (processId) {
  var self = this

  if (!processStatus) {
    this.startProcess(dbModel.uuidFromString(processId), function (err, res) {
      if (err) {
        LOG.error({filename, 'error while processing': err, processId})
      } else {
        LOG.info({filename, processId: processId, status: 'processed successfully'})
      }

      _.remove(queue, function (item) {
        LOG.info({'removing from queue': res.processid.toString()})
        return item.toString() === res.processid.toString()
      })
      processStatus = false
      LOG.info({filename, 'batch image creation queue:': queue})
      if (queue.length) {
        self.register(queue[0])
      }
    })
  } else {
    queue.push(processId)
    // to remove duplicates from scheduled process
    queue = _.uniq(queue)
  }
}

BatchImageProcessor.prototype.startProcess = function (processId, cb) {
  LOG.info({filename, processId: processId, status: 'started processing'})
  processStatus = true
  var self = this
  async.waterfall([
    function (callback) {
      // get data from table and update status to 1
      dbModel.instance.dialcode_batch.findOne({processid: processId}, function (error, batch) {
        if (error) {
          LOG.error({filename, 'error while getting data from db': error, processId})
        }
        callback(error, batch)
      })
    },
    function (batch, callback) {
      //  update status to 1
      // Generate Audit event
      const cdata = [{id: batch.dialcodes.toString(), type: 'dialCode'}, {id: batch.publisher, type: 'publisher'}]
      const telemetryData = {
        edata: telemetry.auditEventData(['status'], 'Update', 'NA'),
        object: telemetry.getObjectData({id: processId, type: 'process'}),
        context: telemetry.getContextData({channel: batch.channel, env: 'dialcode', cdata: cdata}),
        actor: telemetry.getActorData('system', 'system')
      }
      telemetry.audit(telemetryData)
      dbModel.instance.dialcode_batch.update(
        {processid: processId},
        {status: 1}, function (err) {
          if (err) {
            LOG.error({filename, 'error while updating status to 1:': err, processId})
          }
          callback(err, batch)
        })
    },
    function (batch, callback) {
      // create images
      self.createImages(batch, function (err, images) {
        if (err) {
          LOG.error({filename, 'error while creating images': err, processId})
        }
        callback(err, images, batch)
      })
    },
    function (images, batch, callback) {
      // zip folder
      var sourceFile = path.join(process.env.dial_code_image_temp_folder, batch.channel,
        batch.publisher, batch.processid.toString())
      var zipFile = sourceFile + '.zip'
      zipFolder(sourceFile, zipFile, function (err) {
        if (err) {
          LOG.error({filename, 'error while zipping folder:': err, processId, folder: sourceFile})
        }
        callback(err, batch, zipFile)
      })
    },
    function (batch, filePath, callback) {
      // upload file
      self.filePath = filePath
      var destPath = path.join(batch.channel, batch.publisher, batch.processid.toString()) + '.zip'
      uploadUtil.uploadFile(destPath, filePath, function (error, result) {
        if (error) {
          LOG.error({filename, 'error while uploading zip file:': error, processId, zipFile: filePath})
        }
        callback(error, batch, filePath, process.env.sunbird_image_storage_url + destPath)
      })
    },
    function (batch, filePath, fileUrl, callback) {
      // update status to 2 and url
      // Generate Audit event
      const cdata = [{id: batch.dialcodes.toString(), type: 'dialCode'}, {id: batch.publisher, type: 'publisher'}]
      const telemetryData = {
        edata: telemetry.auditEventData(['status'], 'Update', 'NA'),
        object: telemetry.getObjectData({id: processId, type: 'process'}),
        context: telemetry.getContextData({channel: batch.channel, env: 'dialcode', cdata: cdata}),
        actor: telemetry.getActorData('system', 'system')
      }
      telemetry.audit(telemetryData)
      dbModel.instance.dialcode_batch.update(
        {processid: batch.processid},
        {url: fileUrl, status: 2}, function (err) {
          if (err) {
            LOG.error({filename, 'error while updating status to 2:': err, processId})
          }
          callback(err, batch)
        })
    }
  ], function (err, batch) {
    // delete local file create
    try {
      fs.unlinkSync(self.filePath)
      rimraf.sync(path.join(process.env.dial_code_image_temp_folder, batch.channel,
        batch.publisher, batch.processid.toString()))
    } catch (e) {
      LOG.error({filename, 'error while deleting local files:': e, filePath: self.filePath})
    }
    cb(err, batch)
  })
}

BatchImageProcessor.prototype.createImages = function (batch, cb) {
  var error = null
  var imageService
  var imageData = {}
  var q = async.queue(function (task, callback) {
    imageService = new ImageService(batch.config)
    imageService.getImage(task.dialcode, task.channel, task.publisher, task.localFilePath,
      undefined, false, function (err, file) {
        imageData[task.dialcode] = path.basename(file.url)
        if (file.created) {
          callback(err, file.url)
        } else {
          var sourcePath = file.url.replace(process.env.sunbird_image_storage_url, '')
          var destPath = path.join(task.localFilePath, path.basename(file.url))
          uploadUtil.downloadFile(destPath, sourcePath, function (err) {
            callback(err, file.url)
          })
        }
      })
  }, 5)

  q.drain = function () {
    cb(error, batch)
  }

  for (var i = batch.dialcodes.length - 1; i >= 0; i--) {
    q.push(
      { dialcode: batch.dialcodes[i],
        publisher: batch.publisher,
        channel: batch.channel,
        localFilePath: path.join(process.env.dial_code_image_temp_folder, batch.channel, batch.publisher,
          batch.processid.toString())
      }, function (err) {
        error = err
      })
  }
}

var batchImageProcess = new BatchImageProcessor()

process.on('message', (data) => {
  LOG.info({filename, 'process registed with process id: ': data.processId})
  batchImageProcess.register(data.processId)
})
