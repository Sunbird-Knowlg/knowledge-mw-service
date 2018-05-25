var request = require('request')
var host = 'http://localhost:5000'
var fetchMetaUrl = host + '/url/v1/fetchmeta'
var validUrl = 'http://www.dailymotion.com/video/x27zxy8'
var inValidUrl = 'http://www.dailymotionsss.com/video/x27zxy8'

describe('externalUrlMeta', function () {
  describe('fetch url meta service', function () {
    it('should handle failure errors incase of invalid url', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: fetchMetaUrl,
        body: {
          'request': {
            'url': inValidUrl
          }
        },
        json: true
      }, function (error, response, body) {
        expect(response.statusCode).toBe(500)
        expect(error).toBeDefined()
        expect(body.params.err).toBeDefined()
        expect(body.params.errmsg).toBeDefined()
        done()
      })
    })
    it('should return valid metdata incase of valid url', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: fetchMetaUrl,
        body: {
          'request': {
            'url': validUrl
          }
        },
        json: true
      }, function (error, response, body) {
        expect(body.responseCode).toBe('OK')
        expect(error).toEqual(null)
        expect(body.result).toBeDefined()
        done()
      })
    })
  })
})
