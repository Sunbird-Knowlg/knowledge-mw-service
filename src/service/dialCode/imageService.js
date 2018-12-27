var async = require('async')
var _ = require('lodash')
var path = require('path')
var fs = require('fs')
var fse = require('fs-extra')
var LOG = require('sb_logger_util')
var uuid = require('uuid')
var ColorUtil = require('./../../utils/colorUtil')
var QRCodeUtil = require('./../../utils/qrCodeUtil')
var qrCodeUtil = new QRCodeUtil()
var dbModel = require('./../../utils/cassandraUtil').getConnections('dialcodes')
var colorConvert = new ColorUtil()
var currentFile = path.basename(__filename)
var errorCorrectionLevels = ['L', 'M', 'Q', 'H']

function ImageService(config) {
  this.config = config;
}

ImageService.prototype.getImage = function generateImage(dialcode, channel, publisher, cb) {

  this.getImgFromDB(dialcode, channel, publisher, function (error, images) {
    var image = compareImageConfig(images, self.configToString())
    if (!error && image && image.url) {
      cb(null, { url: image.url, 'created': false })
    } else {
      cb(error, null);
    }
  })

}


ImageService.prototype.insertImg = function (dialcode, channel, publisher, fileNamePrefix, callback) {
  var fileName = fileNamePrefix + '_' + dialcode;
  var image = new dbModel.instance.dialcode_images({
    dialcode: dialcode,
    config: this.configToString(),
    status: 0,
    filename: fileName,
    channel: channel,
    publisher: publisher
  })
  image.save(function (error) {
    if (error) {
      LOG.error({
        'Unable to insert data to images table : ': error,
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

ImageService.prototype.getConfig = function () {
  return this.config;
}

ImageService.prototype.getImgFromDB = function (dialcode, channel, publisher, callback) {
  dbModel.instance.dialcode_images.find(
    {
      dialcode: dialcode,
      channel: channel,
      publisher: publisher
    },
    { allow_filtering: true },
    function (error, images) {
      if (error) {
        LOG.error({
          'Unable to query dial code images before creating one : ': error,
          dialcode,
          channel,
          publisher
        })
      }
      callback(error, images)
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
