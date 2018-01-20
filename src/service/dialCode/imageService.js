var async = require('async')
var _ = require('lodash')
var path = require('path')
var fs = require('fs')
var fx = require('mkdir-recursive')
var LOG = require('sb_logger_util')
var ColorUtil = require('./../../utils/colorUtil')
var QRCodeUtil = require('./../../utils/qrCodeUtil')
var qrCodeUtil = new QRCodeUtil()
var dbModel = require('./../../utils/cassandraUtil')
var UploadUtil = require('./../../utils/uploadUtil')
var uploadUtil = new UploadUtil()
var colorConvert = new ColorUtil()
var currentFile = path.basename(__filename)
var errorCorrectionLevels = ['L', 'M', 'Q', 'H']

function ImageService (config) {
  this.color = _.get(config, 'color') ? colorConvert.cmykTohex(config.color) : '#000'
  this.backgroundColor = _.get(config, 'backgroundColor') ? config.backgroundColor : '#ffff'
  this.width = _.toString(_.clamp(_.toSafeInteger(_.get(config, 'width')), 30, 32))
  this.height = _.toString(_.clamp(_.toSafeInteger(_.get(config, 'height')), 30, 32))
  this.margin = _.toString(_.clamp(_.toSafeInteger(_.get(config, 'margin')), 3, 100))
  this.border = (config && parseInt(config.border, 10) >= 0) ? parseInt(config.border, 10) : '1'
  this.text = (config && (config.text === false || config.text === '0')) ? '0' : '1'
  this.errCorrectionLevel = (config && config.errCorrectionLevel && _.indexOf(errorCorrectionLevels, config.errCorrectionLevel) !== -1) ? config.errCorrectionLevel : 'H'
}

ImageService.prototype.getImage = function generateImage (dialcode, channel, publisher, localFilePath, uploadFilePath, deleteLocalFileFlag, cb) {
  var self = this
  var config = self.getConfig()

  var localFileLocation = localFilePath || path.join(process.env.dial_code_image_temp_folder, channel, publisher)
  var uploadFileLocaton = uploadFilePath || path.join(channel, publisher)
  if (deleteLocalFileFlag !== false) {
    deleteLocalFileFlag = true
  }
  // check in cassendra return
  this.getImgFromDB(dialcode, channel, publisher, function (error, images) {
    var image = compareImageConfig(images, self.configToString())
    if (!error && image && image.url) {
      cb(null, {url: image.url, 'created': false})
    } else {
      async.waterfall([
        function (callback) {
          // insert with 1 status
          self.insertImg(dialcode, channel, publisher, callback)
        },
        function (fileName, callback) {
        // genratate Image
          self.fileName = fileName
          var qrText = process.env.sunbird_dial_code_registry_url + dialcode
          var color = config.color
          var bgColor = config.backgroundColor
          var errCorrectionLevel = config.errCorrectionLevel
          var margin = config.margin
          var size = config.width
          try {
            if (!fs.existsSync(localFileLocation)) {
              fx.mkdirSync(localFileLocation)
            }
          } catch (e) {
            LOG.error({currentFile, 'unable create directory': e, directoryPath: localFileLocation})
          }

          qrCodeUtil.generate(path.join(localFileLocation, fileName + '.png'), qrText, color, bgColor, errCorrectionLevel, margin, size, callback)
        },
        function (filePath, callback) {
          var dialcodeText = config.text ? dialcode.trim() : false
          qrCodeUtil.addTextAndBorder(filePath, dialcodeText, config.border, config.color, config.width, callback)
        },
        function (filePath, callback) {
           // upload image

          var destFilePath = uploadFileLocaton ? path.join(uploadFileLocaton, self.fileName + '.png') : filePath
          uploadUtil.uploadFile(destFilePath, filePath, function (error, result) {
            if (error) {
              LOG.error({currentFile, 'Error uploading file': error, filePath, destFilePath})
            }
            callback(error, filePath, process.env.sunbird_image_storage_url + destFilePath)
          })
        },
        function (filePath, fileUrl, callback) {
          dbModel.instance.dialcode_images.update(
              {filename: self.fileName},
              {url: fileUrl, status: 2}, function (err) {
                callback(err, {url: fileUrl, path: filePath})
              })
        }
      ], function (err, results) {
        if (deleteLocalFileFlag) {
          try {
            fs.unlinkSync(results.path)
          } catch (e) {
            LOG.error({'unable delete local file ': e})
          }
        }
        cb(err, {url: results.url, 'created': true})
      })
    }
  })

  // add Text and border
  // resize
  // upload to storage system
  // update status to 2 and url
  // return url
}

ImageService.prototype.getConfig = function () {
  return {
    color: this.color,
    backgroundColor: this.backgroundColor,
    width: parseInt(this.width),
    height: parseInt(this.height),
    margin: parseInt(this.margin),
    border: parseInt(this.border),
    text: parseInt(this.text),
    errCorrectionLevel: this.errCorrectionLevel
  }
}

ImageService.prototype.getImgFromDB = function (dialcode, channel, publisher, callback) {
  dbModel.instance.dialcode_images.find(
    {
      dialcode: dialcode,
      status: 2,
      channel: channel,
      publisher: publisher
    },
    {allow_filtering: true},
    function (error, images) {
      if (error) {
        LOG.error({'Unable to query dial code images before creating one : ': error,
          dialcode,
          channel,
          publisher
        })
      }
      callback(error, images)
    })
}

ImageService.prototype.insertImg = function (dialcode, channel, publisher, callback) {
  var fileName = dialcode + '_' + Date.now()
  var self = this
  var image = new dbModel.instance.dialcode_images({
    dialcode: dialcode,
    config: this.configToString(),
    status: 1,
    filename: fileName,
    channel: channel,
    publisher: publisher
  })
  image.save(function (error) {
    if (error) {
      LOG.error({'Unable to insert data to images table : ': error,
        dialcode,
        channel,
        publisher
      })
      callback(error, null)
    } else {
      callback(error, fileName)
    }
  })
}

ImageService.prototype.configToString = function () {
  return _.mapValues(this.getConfig(), _.method('toString'))
}

var compareImageConfig = function (images, config) {
  var image = null
  _.forEach(images, function (img) {
    if (_.isEqual(img.config, config)) {
      image = img
      return false
    }
  })
  return image
}
module.exports = ImageService
