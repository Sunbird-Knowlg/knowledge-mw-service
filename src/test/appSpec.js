var server = require('../app.js')
var configUtil = require('../libs/sb-config-util')
var _ = require('underscore')
var fs = require('fs')
var request = require('request')
var host = 'http://localhost:5000'
const whiteListedChannelList = process.env.sunbird_content_service_whitelisted_channels
const blackListedChannelList = process.env.sunbird_content_service_blacklisted_channels

const whitelistedFrameworkList = process.env.sunbird_content_filter_framework_whitelist
const blacklistedFrameworkList = process.env.sunbird_content_filter_framework_blacklist

const whitelistedMimeTypeList = process.env.sunbird_content_filter_mimetype_whitelist
const blacklistedMimeTypeList = process.env.sunbird_content_filter_mimetype_blacklist

const whitelistedContentTypeList = process.env.sunbird_content_filter_contenttype_whitelist
const blacklistedContentTypeList = process.env.sunbird_content_filter_contenttype_blacklist

const whitelistedResourceTypeList = process.env.sunbird_content_filter_resourcetype_whitelist
const blacklistedResourceTypeList = process.env.sunbird_content_filter_resourcetype_blacklist

var allowedChannels = whiteListedChannelList ? whiteListedChannelList.split(',') : []
console.log('allowedChannels', allowedChannels)
var blackListedChannels = blackListedChannelList ? blackListedChannelList.split(',') : []
console.log('blackListedChannels', blackListedChannels)
var blackListQuery = {'ne': (blackListedChannels)}

var allowedFramework = whitelistedFrameworkList ? whitelistedFrameworkList.split(',') : []
console.log('allowedFramework', allowedFramework)
var blackListedFramework = blacklistedFrameworkList ? blacklistedFrameworkList.split(',') : []
console.log('blackListedFramework', blackListedFramework)
var allowedMimetype = whitelistedMimeTypeList ? whitelistedMimeTypeList.split(',') : []
var blackListedMimetype = blacklistedMimeTypeList ? blacklistedMimeTypeList.split(',') : []
var allowedContenttype = whitelistedContentTypeList ? whitelistedContentTypeList.split(',') : []
var blackListedContenttype = blacklistedContentTypeList ? blacklistedContentTypeList.split(',') : []
var allowedResourcetype = whitelistedResourceTypeList ? whitelistedResourceTypeList.split(',') : []
var blackListedResourcetype = blacklistedResourceTypeList ? blacklistedResourceTypeList.split(',') : []

const allwhiteListedFilterQuery = {
  channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
  framework: [ 'NCF' ],
  contentType: [ 'Collection' ],
  mimeType: [ 'application/vnd.ekstep.content-collection' ],
  resourceType: [ 'Collection' ]
}

const allblackListedFilterQuery = {
  channel: { ne: ['012345678901210240402'] },
  framework: { ne: [ 'NCFCOPY' ] },
  contentType: { ne: [ 'Resource' ] },
  mimeType: { ne: [ 'application/vnd.ekstep.ecml-archive' ] },
  resourceType: { ne: [ 'Course' ] }
}
// describe('Check health api', function (done) {
//   it('Check with different methods, it should return status code 200', function (done) {
//     request.options({
//       url: host + '/health',
//       json: true
//     }, function (_error, response, body) {
//       expect(body).toBe('OK')
//       done()
//     })
//   })
// })

describe('Check environment config variables for meta filters', function (done) {
  it('check if whiteListed channel is configured', function () {
    if ((allowedChannels && allowedChannels.length > 0) &&
    !(blackListedChannels && blackListedChannels.length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').channel).toEqual(allowedChannels)
    }
  })
  it('check if blackList channel is configured', function () {
    if (!(allowedChannels && allowedChannels.length > 0) &&
    (blackListedChannels && blackListedChannels.length > 0)) {
      console.log('meta json1', configUtil.getConfig('META_FILTER_REQUEST_JSON'))
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').channel).toEqual(blackListQuery)
    }
  })
  it('check if whiteListed framework is configured', function () {})
  it('check if blackList framework is configured', function () {})
  it('check if whiteListed contentType is configured', function () {})
  it('check if blackList contentType is configured', function () {})
  it('check if whiteListed mimeType is configured', function () {})
  it('check if blackList mimeType is configured', function () {})
  it('check if whiteListed resourceType is configured', function () {})
  it('check if blackList resourceType is configured', function () {})

  it('test for whitelist channel and blackList channel not configured', function () {
    if (!(allowedChannels && allowedChannels.length > 0) &&
    !(blackListedChannels && blackListedChannels.length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON')).toEqual(null)
    }
  })

  it('test for all whitelist filter to be configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', allwhiteListedFilterQuery)
    if ((allwhiteListedFilterQuery && Object.keys(allwhiteListedFilterQuery).length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').channel).toEqual(allwhiteListedFilterQuery.channel)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').framework).toEqual(allwhiteListedFilterQuery.framework)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').mimeType).toEqual(allwhiteListedFilterQuery.mimeType)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').contentType).toEqual(allwhiteListedFilterQuery.contentType)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').resourceType).toEqual(allwhiteListedFilterQuery.resourceType)
    }
  })

  it('test for all blacklist filter to be configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', allblackListedFilterQuery)
    if ((allblackListedFilterQuery && Object.keys(allblackListedFilterQuery).length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').channel).toEqual(allblackListedFilterQuery.channel)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').framework).toEqual(allblackListedFilterQuery.framework)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').mimeType).toEqual(allblackListedFilterQuery.mimeType)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').contentType).toEqual(allblackListedFilterQuery.contentType)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').resourceType).toEqual(allblackListedFilterQuery.resourceType)
    }
  })

  it('check if whiteListed and blacklisted meta filters is configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', allwhiteListedFilterQuery)
    if ((allowedChannels && allowedChannels.length > 0) &&
        (blackListedChannels && blackListedChannels.length > 0)) {
      var configString = {}
      var generateConfigString = function (allowedMetadata, blackListedMetadata) {
        if ((allowedMetadata && allowedMetadata.length > 0) && (blackListedMetadata && blackListedMetadata.length > 0)) {
          configString = _.difference(allowedMetadata, blackListedMetadata)
          return configString
        } else if (allowedMetadata && allowedMetadata.length > 0) {
          configString = allowedMetadata
          return configString
        } else if (blackListedMetadata && blackListedMetadata.length > 0) {
          configString = { 'ne': blackListedMetadata }
          return configString
        }
      }
      var channelConf = generateConfigString(allowedChannels, blackListedChannels)
      console.log('channelConf', channelConf)
      console.log('mf conf', configUtil.getConfig('META_FILTER_REQUEST_JSON').channel)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').channel).toEqual(channelConf)
    }
  })
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
// below method used to close server once all the specs are executed
// var _finishCallback = jasmine.Runner.prototype.finishCallback
// jasmine.Runner.prototype.finishCallback = function () {
//   _finishCallback.bind(this)()
//   server.close()
// }
