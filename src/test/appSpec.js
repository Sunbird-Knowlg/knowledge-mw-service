var server = require('../app.js')
var configUtil = require('../libs/sb-config-util')
var _ = require('underscore')

var request = require('request')
var host = 'http://localhost:5000'
const whiteListedChannelList = process.env.sunbird_content_service_whitelisted_channels
const blackListedChannelList = process.env.sunbird_content_service_blacklisted_channels
var whiteListQuery = whiteListedChannelList ? whiteListedChannelList.split(',') : []
var blackListedChannelListNew = blackListedChannelList ? blackListedChannelList.split(',') : []
var blackListQuery = {'ne': (blackListedChannelListNew)}
describe('Check health api', function (done) {
  it('Check with different methods, it should return status code 200', function (done) {
    request.options({
      url: host + '/health',
      json: true
    }, function (_error, response, body) {
      expect(body).toBe('OK')
      done()
    })
  })

  it('test for whiteList configured', function () {
    if ((whiteListQuery && whiteListQuery.length > 0) &&
    !(blackListedChannelListNew && blackListedChannelListNew.length > 0)) {
      expect(configUtil.getConfig('CHANNEL_FILTER_QUERY_STRING')).toEqual(whiteListQuery)
    }
  })

  it('test for blackList configured', function () {
    if (!(whiteListQuery && whiteListQuery.length > 0) &&
    (blackListedChannelListNew && blackListedChannelListNew.length > 0)) {
      expect(configUtil.getConfig('CHANNEL_FILTER_QUERY_STRING')).toEqual(blackListQuery)
    }
  })

  it('test for whitelist and blackList not configured', function () {
    if (!(whiteListQuery && whiteListQuery.length > 0) &&
    !(blackListedChannelListNew && blackListedChannelListNew.length > 0)) {
      expect(configUtil.getConfig('CHANNEL_FILTER_QUERY_STRING')).toEqual({})
    }
  })

  it('test for whitelist and blackList is configured', function () {
    if ((whiteListQuery && whiteListQuery.length > 0) &&
    (blackListedChannelListNew && blackListedChannelListNew.length > 0)) {
      var searchQuery = _.difference(whiteListQuery, blackListedChannelListNew)
      expect(configUtil.getConfig('CHANNEL_FILTER_QUERY_STRING')).toEqual(searchQuery)
    }
  })

  describe('Check environment config variables for meta filters', function (done) {
    it('check if whiteListed channel is configured', function () {})
    it('check if blackList channel is configured', function () {})
    it('check if whiteListed framework is configured', function () {})
    it('check if blackList framework is configured', function () {})
    it('check if whiteListed contentType is configured', function () {})
    it('check if blackList contentType is configured', function () {})
    it('check if whiteListed mimeType is configured', function () {})
    it('check if blackList mimeType is configured', function () {})
    it('check if whiteListed resourceType is configured', function () {})
    it('check if blackList resourceType is configured', function () {})

    it('check if whiteListed and blacklisted channel is configured', function () {})
    it('check if whiteListed and blacklisted framework is configured', function () {})
    it('check if whiteListed and blacklisted contentType is configured', function () {})
    it('check if whiteListed and blacklisted resourceType is configured', function () {})
    it('check if whiteListed and blacklisted mimeType is configured', function () {})

    it('Check if filterConfig service data is available', function () {})
    it('If FilterConfig is null/undefined, generate filter Object from environment variables', function () { })

    it('Check if filter JSON is generated and assigned to META_FILTER_QUERY_STRING', function () { })
    it('Check if filter JSON is not generated, not assigned to META_FILTER_QUERY_STRING', function () { })

    it('if framework and channel is configured', function () { })
    it('if framework and mimeType is configured', function () { })
    it('if framework and resourceType is configured', function () { })
    it('if channel and resourceType is configured', function () { })
    it('if contentType and mimeType is configured', function () { })
    it('if contentType and resourceType is configured', function () { })
    it('if channel and resourceType is configured', function () { })

    // Negative scenarios of 3 combination not present
    it('if contentType, mimeType, resourceType is not configured', function () { })
    it('if contentType, channel, resourceType is not configured', function () { })
    it('if contentType, mimeType, channel is not configured', function () { })
    it('if contentType, mimeType, framework is not configured', function () { })
    it('if channel, framework, resourceType is not configured', function () { })
    it('if channel, mimeType, framework is not configured', function () { })
    it('if contentType, mimeType, framework is not configured', function () { })
  })
})
// below method used to close server once all the specs are executed
var _finishCallback = jasmine.Runner.prototype.finishCallback
jasmine.Runner.prototype.finishCallback = function () {
  _finishCallback.bind(this)()
  server.close()
}
