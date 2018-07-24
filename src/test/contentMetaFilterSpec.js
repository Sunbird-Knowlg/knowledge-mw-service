var configUtil = require('../libs/sb-config-util')
var _ = require('lodash')

const whiteListedChannelList = process.env.sunbird_content_service_whitelisted_channels
const blackListedChannelList = process.env.sunbird_content_service_blacklisted_channels

const whitelistedFrameworkList = process.env.sunbird_content_service_whitelisted_framework
const blacklistedFrameworkList = process.env.sunbird_content_service_blacklisted_framework

const whitelistedMimeTypeList = process.env.sunbird_content_service_whitelisted_mimetype
const blacklistedMimeTypeList = process.env.sunbird_content_service_blacklisted_mimetype

const whitelistedContentTypeList = process.env.sunbird_content_service_whitelisted_contenttype
const blacklistedContentTypeList = process.env.sunbird_content_service_blacklisted_contenttype

const whitelistedResourceTypeList = process.env.sunbird_content_service_whitelisted_resourcetype
const blacklistedResourceTypeList = process.env.sunbird_content_service_blacklisted_resourcetype

var allowedChannels = whiteListedChannelList ? whiteListedChannelList.split(',') : []
var blackListedChannels = blackListedChannelList ? blackListedChannelList.split(',') : []
var blackListQuery = {'ne': (blackListedChannels)}

var allowedFramework = whitelistedFrameworkList ? whitelistedFrameworkList.split(',') : []
var blackListedFramework = blacklistedFrameworkList ? blacklistedFrameworkList.split(',') : []
var blackListFrameworkQuery = {'ne': (blackListedFramework)}
var allowedMimetype = whitelistedMimeTypeList ? whitelistedMimeTypeList.split(',') : []
var blackListedMimetype = blacklistedMimeTypeList ? blacklistedMimeTypeList.split(',') : []
var blackListMimetypeQuery = {'ne': [(blacklistedMimeTypeList)]}
var allowedContenttype = whitelistedContentTypeList ? whitelistedContentTypeList.split(',') : []
var blackListedContenttype = blacklistedContentTypeList ? blacklistedContentTypeList.split(',') : []
var blackListContenttypeQuery = {'ne': [(blacklistedContentTypeList)]}
var allowedResourcetype = whitelistedResourceTypeList ? whitelistedResourceTypeList.split(',') : []
var blackListedResourcetype = blacklistedResourceTypeList ? blacklistedResourceTypeList.split(',') : []
var blackListResourcetypeQuery = {'ne': [(blacklistedResourceTypeList)]}

const allwhiteListedFilterQuery = {
  channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
  framework: [ 'NCF' ],
  contentType: [ 'Resource' ],
  mimeType: [ 'application/vnd.ekstep.content-collection' ],
  resourceType: [ 'Learn' ]
}

const allblackListedFilterQuery = {
  channel: { ne: ['0124758418460180480', '0124758449502453761'] },
  framework: { ne: [ '01231711180382208027', '012315809814749184151' ] },
  contentType: { ne: [ 'Story' ] },
  mimeType: { ne: [ 'application/vnd.ekstep.h5p-archive' ] },
  resourceType: { ne: [ 'Read' ] }
}
const emptyFilterQuery = {}

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
var frameworkConf = generateConfigString(allowedFramework, blackListedFramework)
var mimeTypeConf = generateConfigString(allowedMimetype, blackListedMimetype)
var contentTypeConf = generateConfigString(allowedContenttype, blackListedContenttype)
var resourceTypeConf = generateConfigString(allowedResourcetype, blackListedResourcetype)

describe('Check environment config variables for meta filters', function (done) {
  it('check if whiteListed channel is configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', allwhiteListedFilterQuery)
    if ((allowedChannels && allowedChannels.length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').channel).toEqual(allowedChannels)
    }
  })
  it('check if whiteListed framework is configured', function () {
    if ((allowedFramework && allowedFramework.length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').framework).toEqual(allowedFramework)
    }
  })
  it('check if whiteListed contentType is configured', function () {
    if ((allowedContenttype && allowedContenttype.length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').contentType).toEqual(allowedContenttype)
    }
  })
  it('check if whiteListed mimeType is configured', function () {
    if ((allowedMimetype && allowedMimetype.length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').mimeType).toEqual(allowedMimetype)
    }
  })
  it('check if whiteListed resourceType is configured', function () {
    if ((allowedResourcetype && allowedResourcetype.length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').resourceType).toEqual(allowedResourcetype)
    }
  })

  it('check if blackList channel is configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', allblackListedFilterQuery)
    if ((blackListedChannels && blackListedChannels.length > 0)) {
      expect(_.isEqual(configUtil.getConfig('META_FILTER_REQUEST_JSON').channel, blackListQuery)).toBeTruthy()
    }
  })
  it('check if blackList framework is configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', allblackListedFilterQuery)
    if ((blackListedFramework && blackListedFramework.length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').framework).toEqual(blackListFrameworkQuery)
    }
  })

  it('check if blackList contentType is configured', function () {
    if ((blackListedContenttype && blackListedContenttype.length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').contentType).toEqual(blackListContenttypeQuery)
    }
  })

  it('check if blackList mimeType is configured', function () {
    if ((blackListedMimetype && blackListedMimetype.length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').mimeType).toEqual(blackListMimetypeQuery)
    }
  })

  it('check if blackList resourceType is configured', function () {
    if ((blackListedResourcetype && blackListedResourcetype.length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').resourceType).toEqual(blackListResourcetypeQuery)
    }
  })

  it('test for whitelist channel and blackList channel not configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', emptyFilterQuery)
    if ((allowedChannels.length > 0) && (blackListedChannels.length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON')).toEqual({})
    }
  })

  it('test for all whitelist filter to be configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', allwhiteListedFilterQuery)
    if ((allwhiteListedFilterQuery && Object.keys(allwhiteListedFilterQuery).length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').channel).toEqual(allwhiteListedFilterQuery.channel)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').framework).toEqual(allwhiteListedFilterQuery.framework)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').mimeType).toEqual(allwhiteListedFilterQuery.mimeType)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').contentType)
        .toEqual(allwhiteListedFilterQuery.contentType)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').resourceType)
        .toEqual(allwhiteListedFilterQuery.resourceType)
    }
  })

  it('test for all blacklist filter to be configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', allblackListedFilterQuery)
    if ((allblackListedFilterQuery && Object.keys(allblackListedFilterQuery).length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').channel).toEqual(allblackListedFilterQuery.channel)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').framework).toEqual(allblackListedFilterQuery.framework)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').mimeType).toEqual(allblackListedFilterQuery.mimeType)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').contentType)
        .toEqual(allblackListedFilterQuery.contentType)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON').resourceType)
        .toEqual(allblackListedFilterQuery.resourceType)
    }
  })

  it('check if whiteListed and blacklisted channel filters is configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', allwhiteListedFilterQuery)
    if ((allowedChannels && allowedChannels.length > 0) &&
          (blackListedChannels && blackListedChannels.length > 0)) {
      expect(_.isEqual(configUtil.getConfig('META_FILTER_REQUEST_JSON').channel, channelConf)).toBeTruthy()
      expect(_.isEqual(configUtil.getConfig('META_FILTER_REQUEST_JSON').mimeType, mimeTypeConf)).toBeTruthy()
      expect(_.isEqual(configUtil.getConfig('META_FILTER_REQUEST_JSON').resourceType, resourceTypeConf)).toBeTruthy()
    }
  })
  it('check if whiteListed and blacklisted framework is configured', function () {
    if ((allowedFramework && allowedFramework.length > 0) && (blackListedFramework &&
        blackListedFramework.length > 0)) {
      expect(_.isEqual(configUtil.getConfig('META_FILTER_REQUEST_JSON').framework, frameworkConf)).toBeTruthy()
    }
  })
  it('check if whiteListed and blacklisted contentType is configured', function () {
    if ((allowedContenttype && allowedContenttype.length > 0) &&
      (blackListedContenttype && blackListedContenttype.length > 0)) {
      expect(_.isEqual(configUtil.getConfig('META_FILTER_REQUEST_JSON').contentType, contentTypeConf)).toBeTruthy()
    }
  })
  it('check if whiteListed and blacklisted resourceType is configured', function () {
    if ((allowedResourcetype && allowedResourcetype.length > 0) &&
      (blackListedResourcetype && blackListedResourcetype.length > 0)) {
      expect(_.isEqual(configUtil.getConfig('META_FILTER_REQUEST_JSON').resourceType, resourceTypeConf)).toBeTruthy()
    }
  })
  it('check if whiteListed and blacklisted mimeType is configured', function () {
    if ((allowedMimetype && allowedMimetype.length > 0) &&
      (blackListedMimetype && blackListedMimetype.length > 0)) {
      expect(_.isEqual(configUtil.getConfig('META_FILTER_REQUEST_JSON').mimeType, mimeTypeConf)).toBeTruthy()
    }
  })

  it('If FilterConfig is null/undefined, generate filter Object from environment variables', function () {
    const filterService = ''
    if (filterService === '') {
      var generateJSON = {
        channel: channelConf,
        framework: frameworkConf,
        contentType: contentTypeConf,
        mimeType: mimeTypeConf,
        resourceType: resourceTypeConf
      }
      expect((generateJSON).channel).toEqual(allwhiteListedFilterQuery.channel)
      expect((generateJSON).framework).toEqual(allwhiteListedFilterQuery.framework)
      expect((generateJSON).contentType).toEqual(allwhiteListedFilterQuery.contentType)
      expect((generateJSON).resourceType).toEqual(allwhiteListedFilterQuery.resourceType)
      expect((generateJSON).mimeType).toEqual(allwhiteListedFilterQuery.mimeType)
      configUtil.setConfig('META_FILTER_REQUEST_JSON', generateJSON)
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON')).toEqual(generateJSON)
    }
  })

  it('Check if filter JSON is not generated, not assigned to META_FILTER_REQUEST_JSON', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', {})
    expect(configUtil.getConfig('META_FILTER_REQUEST_JSON')).toEqual({})
  })
})

// Negative scenarios of 3 combination not present
describe('Combination of 3 filters are not configured', function (done) {
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

  it('if contentType, mimeType, resourceType is not configured', function () {
    const chFwfilterQuery = {
      channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
      framework: [ 'NCF' ]
    }
    allowedMimetype = []
    blackListedMimetype = []
    allowedContenttype = []
    blackListedContenttype = []
    allowedResourcetype = []
    blackListedResourcetype = []

    var channelConf = generateConfigString(allowedChannels, blackListedChannels)
    var frameworkConf = generateConfigString(allowedFramework, blackListedFramework)
    var mimeTypeConf = generateConfigString(allowedMimetype, blackListedMimetype)
    var contentTypeConf = generateConfigString(allowedContenttype, blackListedContenttype)
    var resourceTypeConf = generateConfigString(allowedResourcetype, blackListedResourcetype)

    if (chFwfilterQuery) {
      configUtil.setConfig('META_FILTER_REQUEST_JSON', chFwfilterQuery)
      expect(_.isEqual(configUtil.getConfig('META_FILTER_REQUEST_JSON').channel, channelConf)).toBeTruthy()
      expect(_.isEqual(configUtil.getConfig('META_FILTER_REQUEST_JSON').framework, frameworkConf)).toBeTruthy()
      expect(mimeTypeConf).toBeUndefined()
      expect(contentTypeConf).toBeUndefined()
      expect(resourceTypeConf).toBeUndefined()
    }
  })

  it('if contentType, channel, resourceType is not configured', function () {
    const mimeFwfilterQuery = {
      mimeType: ['application/vnd.ekstep.content-collection'],
      framework: [ 'NCF' ]
    }
    allowedContenttype = []
    blackListedContenttype = []

    allowedChannels = []
    blackListedChannels = []

    allowedResourcetype = []
    blackListedResourcetype = []

    var allowedMimetype = whitelistedMimeTypeList ? whitelistedMimeTypeList.split(',') : []
    var blackListedMimetype = blacklistedMimeTypeList ? blacklistedMimeTypeList.split(',') : []

    var channelConf = generateConfigString(allowedChannels, blackListedChannels)
    var frameworkConf = generateConfigString(allowedFramework, blackListedFramework)
    var mimeTypeConf = generateConfigString(allowedMimetype, blackListedMimetype)
    var contentTypeConf = generateConfigString(allowedContenttype, blackListedContenttype)
    var resourceTypeConf = generateConfigString(allowedResourcetype, blackListedResourcetype)

    if (mimeFwfilterQuery) {
      configUtil.setConfig('META_FILTER_REQUEST_JSON', mimeFwfilterQuery)
      expect(_.isEqual(configUtil.getConfig('META_FILTER_REQUEST_JSON').mimeType, mimeTypeConf)).toBeTruthy()
      expect(_.isEqual(configUtil.getConfig('META_FILTER_REQUEST_JSON').framework, frameworkConf)).toBeTruthy()
      expect(channelConf).toBeUndefined()
      expect(contentTypeConf).toBeUndefined()
      expect(resourceTypeConf).toBeUndefined()
    }
  })
})
