var azure = require('azure-storage')
var LOG = require('sb_logger_util')
var path = require('path')
var fs = require('fs')
var fse = require('fs-extra')
var filename = path.basename(__filename)
var blobService = azure.createBlobService(process.env.sunbird_azure_account_name, process.env.sunbird_azure_account_key)

function UploadUtil (name) {
  this.containerName = name || 'dial'
  var self = this
  blobService.createContainerIfNotExists(this.containerName, { publicAccessLevel: 'blob' }, function (err) {
    if (err) {
      LOG.error({filename, 'Unable to create container in azure : ': err})
    } else {
      LOG.info({filename, 'if not exist ,Creating container  is successful with name': self.containerName})
    }
  })
}

UploadUtil.prototype.uploadFile = function uploadFile (destPath, sourcePath, callback) {
  blobService.createBlockBlobFromLocalFile(this.containerName || 'dial', destPath, sourcePath, callback)
}

UploadUtil.prototype.deleteFile = function deleteFile (filePath, callback) {
  blobService.deleteBlobIfExists(this.containerName, filePath, callback)
}

UploadUtil.prototype.downloadFile = function downloadFile (destPath, sourcePath, callback) {
  fse.ensureFileSync(destPath)
  blobService.getBlobToStream(this.containerName, sourcePath, fs.createWriteStream(destPath), function (error, result, response) {
    if (error) {
      LOG.error({filename, 'Unable to download file from azure : ': error})
    } else {
      LOG.info({filename, 'successful downloaded file from': sourcePath, 'to the location': destPath})
    }
    callback(error, destPath)
  })
}

module.exports = UploadUtil
