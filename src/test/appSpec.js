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
})

// below method used to close server once all the specs are executed
var _finishCallback = jasmine.Runner.prototype.finishCallback
jasmine.Runner.prototype.finishCallback = function () {
  _finishCallback.bind(this)()
  server.close()
}
