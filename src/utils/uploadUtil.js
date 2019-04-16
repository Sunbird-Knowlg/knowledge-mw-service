var azure = require('azure-storage')
var logger = require('sb_logger_util_v2')
var path = require('path')
var fs = require('fs')
var fse = require('fs-extra')
var filename = path.basename(__filename)
var blobService = azure.createBlobService(process.env.sunbird_azure_account_name, process.env.sunbird_azure_account_key)

function UploadUtil(name) {
  this.containerName = name || 'dial'
  blobService.createContainerIfNotExists(this.containerName, { publicAccessLevel: 'blob' }, function (err) {
    if (err) {
      logger.error({ msg: 'Unable to create a container in azure', err, additionalInfo: { name: this.containerName } })
    }
  })
}

UploadUtil.prototype.uploadFile = function uploadFile(destPath, sourcePath, callback) {
  blobService.createBlockBlobFromLocalFile(this.containerName || 'dial', destPath, sourcePath, callback)
}

UploadUtil.prototype.deleteFile = function deleteFile(filePath, callback) {
  blobService.deleteBlobIfExists(this.containerName, filePath, callback)
}

UploadUtil.prototype.downloadFile = function downloadFile(destPath, sourcePath, callback) {
  fse.ensureFileSync(destPath)
  blobService.getBlobToStream(this.containerName, sourcePath, fs.createWriteStream(destPath),
    function (error, result, response) {
      if (error) {
        logger.error({
          msg: 'Unable to download file from azure',
          error,
          additionalInfo: { name: this.containerName, sourcePath }
        })
      }
      callback(error, destPath)
    })
}

module.exports = UploadUtil
