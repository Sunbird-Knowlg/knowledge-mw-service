var server = require('../app.js')
var configUtil = require('../libs/sb-config-util')

var request = require('request')
var host = 'http://localhost:5000'

describe('Check health api', function (done) {
  it('Check with different methods, it should return status code 200', function (done) {
    request.options({
      url: host + '/health',
      json: true
    }, function (_error, response, body) {
      expect(body).toBe('OK')
      var whiteListQuery = (process.env.sunbird_content_service_whitelisted_channels).split(',')
      var blackListQuery = {'ne': ((process.env.sunbird_content_service_blacklisted_channels).split(','))}
      expect(configUtil.getConfig('CHANNEL_FILTER_QUERY_STRING')).toEqual(whiteListQuery || blackListQuery)
      done()
    })
  })
})

// below method used to close server once all the specs are executed
var _finishCallback = jasmine.Runner.prototype.finishCallback
jasmine.Runner.prototype.finishCallback = function () {
  _finishCallback.bind(this)()
  server.close()
}
