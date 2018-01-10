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
  return Math.floor(data * 2.5)
}

qrCodeUtil.prototype.generate = function generateImage (filePath, text, color, bgColor, errorCorrectionLevel, margin, callback) {
  QRCode.toFile(filePath, text, { // dynamic - name should be dial code
    color: {
      dark: color,
      light: bgColor
    },
    errorCorrectionLevel: errorCorrectionLevel,
    margin: margin
  }, function (err) {
    if (err) {
      LOG.error({filename, 'qrcode generation error': err})
    } else {
      LOG.info(
        {filename,
          'qrcode generated successfully with file': filePath,
          text,
          color,
          bgColor,
          errorCorrectionLevel,
          margin
        })
    }

    callback(err, filePath)
  })
}

qrCodeUtil.prototype.addTextAndBorder = function addTextAndBorder (filePath, text, border, color, callback) {
  var tempgm = gm()
  tempgm.in('-geometry', '1000X1000')

  if (text) {
    tempgm
          .in('-extent', '1000X1070')
          .in('-fill', color)
          .in('-font', path.join(__dirname, './../libs/fonts/arial/ARIALBD.ttf'))
          .in('-pointsize', '100')
          .drawText(0, 0, text, 'south')
  }
  tempgm.borderColor(color)
        .border(border, border)
        .in(filePath)
        .write(filePath, function (err) {
          if (err) {
            LOG.error({filename, 'Unable to add text or border : ': err})
          } else {
            LOG.info(
              {filename,
                'add text or border to file': filePath,
                text,
                border,
                color
              })
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
        } else {
          LOG.info(
            {filename,
              'Resize image is success of file ': filePath,
              width,
              height
            })
        }
        callback(err, filePath)
      })
}

module.exports = qrCodeUtil
