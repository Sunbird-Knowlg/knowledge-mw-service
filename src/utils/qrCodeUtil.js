/**
 * @name : qrCodeUtil.js
 * @description :: It creates and update the QR code image
 * @author      :: Hairsh Kumar Gangula<harishg@ilimi.in>
 */

var QRCode = require('qrcode')
var gm = require('gm').subClass({ imageMagick: true })
var LOG = require('sb_logger_util')
var path = require('path')
var filename = path.basename(__filename)

function qrCodeUtil () {}

qrCodeUtil.prototype.mmToPixel = function mmToPixel (data) {
  return Math.floor(data * 2.6)
}

qrCodeUtil.prototype.generate = function generateImage (filePath, text, color,
  bgColor, errorCorrectionLevel, margin, size, callback) {
  QRCode.toFile(filePath, text, { // dynamic - name should be dial code
    color: {
      dark: color,
      light: bgColor
    },
    errorCorrectionLevel: errorCorrectionLevel,
    margin: margin,
    width: this.mmToPixel(size)
  }, function (err) {
    if (err) {
      LOG.error({filename, 'qrcode generation error': err})
    }
    callback(err, filePath)
  })
}

qrCodeUtil.prototype.addTextAndBorder = function addTextAndBorder (filePath, text, border, color, size, callback) {
  var tempgm = gm()
  if (text) {
    tempgm
      .in('-extent', this.mmToPixel(size) + 'X' + (this.mmToPixel(size) + 10))
      .in('-fill', color)
      .in('-font', path.join(__dirname, './../assets/fonts/arial/arialbold.ttf'))
      .drawText(0, 0, text, 'south')
  }
  tempgm.borderColor(color)
    .border(border, border)
    .in(filePath)
    .write(filePath, function (err) {
      if (err) {
        LOG.error({filename, 'Unable to add text or border : ': err})
      }
      callback(err, filePath)
    })
}

qrCodeUtil.prototype.resize = function resize (filePath, width, height, callback) {
  gm()
    .in('-geometry', this.mmToPixel(width) + 'X' + this.mmToPixel(height) + '!')
    .in(filePath)
    .write(filePath, function (err) {
      if (err) {
        LOG.error({filename, 'Unable to resize image : ': err})
      }
      callback(err, filePath)
    })
}

module.exports = qrCodeUtil
