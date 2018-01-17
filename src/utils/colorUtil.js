function colorUtil () {}

colorUtil.prototype.cmykTohex = function (cmyk) {
  var rgb = this.cmykTorgb(cmyk)
  return '#' + this.rgbTohex(rgb)
}

colorUtil.prototype.cmykTorgb = function (cmyk) {
  var cmykSplit = cmyk.split(',')
  var c = cmykSplit[0]
  var m = cmykSplit[1]
  var y = cmykSplit[2]
  var k = cmykSplit[3]

  var cmykC = Number(c)
  var cmykM = Number(m)
  var cmykY = Number(y)
  var cmykK = Number(k)

  if (cmykC > 0) {
    cmykC = cmykC / 100
  } else if (cmykM > 0) {
    cmykM = cmykM / 100
  } else if (cmykY > 0) {
    cmykY = cmykY / 100
  } else if (cmykK > 0) {
    cmykK = cmykK / 100
  }

  var rgbR = 1 - Math.min(1, cmykC * (1 - cmykK) + cmykK)
  var rgbG = 1 - Math.min(1, cmykM * (1 - cmykK) + cmykK)
  var rgbB = 1 - Math.min(1, cmykY * (1 - cmykK) + cmykK)

  rgbR = Math.round(rgbR * 255)
  rgbG = Math.round(rgbG * 255)
  rgbB = Math.round(rgbB * 255)

  return (rgbR + ',' + rgbG + ',' + rgbB)
}

colorUtil.prototype.rgbTohex = function (rgb) {
  var rgbSplit = rgb.split(',')
  var R = rgbSplit[0]
  var G = rgbSplit[1]
  var B = rgbSplit[2]
  return toHex(R) + toHex(G) + toHex(B)
}

function toHex (n) {
  n = parseInt(n, 10)
  if (isNaN(n)) { return '00' }
  n = Math.max(0, Math.min(n, 255))
  return '0123456789ABCDEF'.charAt((n - n % 16) / 16) +
      '0123456789ABCDEF'.charAt(n % 16)
}

module.exports = colorUtil
