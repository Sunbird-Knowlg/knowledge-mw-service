var configUtil = require('../libs/sb-config-util')
var _ = require('lodash')

var contentMetaConfig = require('./contentMetaConfig')

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

function generateConfigString (metaFiltersArray) {
  var configArray = {}
  _.forOwn(metaFiltersArray, function (value, key) {
    const allowedMetadata = value[0]
    const blackListedMetadata = value[1]
    if ((allowedMetadata && allowedMetadata.length > 0) && (blackListedMetadata && blackListedMetadata.length > 0)) {
      configArray[key] = _.difference(allowedMetadata, blackListedMetadata)
    } else if (allowedMetadata && allowedMetadata.length > 0) {
      configArray[key] = allowedMetadata
    } else if (blackListedMetadata && blackListedMetadata.length > 0) {
      configArray[key] = { 'ne': blackListedMetadata }
    }
  })
  return configArray
}
var metaFiltersArray = {
  'channel': [contentMetaConfig.allowedChannels, contentMetaConfig.blackListedChannels],
  'framework': [contentMetaConfig.allowedFramework, contentMetaConfig.blacklistedFramework],
  'mimeType': [contentMetaConfig.allowedMimetype, contentMetaConfig.blackListedMimetype],
  'contentType': [contentMetaConfig.allowedContenttype, contentMetaConfig.blackListedContenttype],
  'resourceType': [contentMetaConfig.allowedResourcetype, contentMetaConfig.blackListedResourcetype]
}

var generateConfigArray = generateConfigString(metaFiltersArray)
var channelConf = generateConfigArray.channel
var frameworkConf = generateConfigArray.framework
var mimeTypeConf = generateConfigArray.mimeType
var contentTypeConf = generateConfigArray.contentType
var resourceTypeConf = generateConfigArray.resourceType

describe('Check environment config variables for meta filters for whitelisted filter query', function (done) {
  configUtil.setConfig('META_FILTER_REQUEST_JSON', allwhiteListedFilterQuery)
  var generateJSON = configUtil.getConfig('META_FILTER_REQUEST_JSON')
  it('check if whiteListed channel is configured', function () {
    if ((contentMetaConfig.allowedChannels && (contentMetaConfig.allowedChannels).length > 0)) {
      expect(generateJSON.channel).toEqual(contentMetaConfig.allowedChannels)
    }
  })
  it('check if whiteListed framework is configured', function () {
    if ((contentMetaConfig.allowedFramework && (contentMetaConfig.allowedFramework).length > 0)) {
      expect(generateJSON.framework).toEqual(contentMetaConfig.allowedFramework)
    }
  })
  it('check if whiteListed contentType is configured', function () {
    if ((contentMetaConfig.allowedContenttype && (contentMetaConfig.allowedContenttype).length > 0)) {
      expect(generateJSON.contentType).toEqual(contentMetaConfig.allowedContenttype)
    }
  })
  it('check if whiteListed mimeType is configured', function () {
    if ((contentMetaConfig.allowedMimetype && (contentMetaConfig.allowedMimetype).length > 0)) {
      expect(generateJSON.mimeType).toEqual(contentMetaConfig.allowedMimetype)
    }
  })
  it('check if whiteListed resourceType is configured', function () {
    if ((contentMetaConfig.allowedResourcetype && (contentMetaConfig.allowedResourcetype).length > 0)) {
      expect(generateJSON.resourceType).toEqual(contentMetaConfig.allowedResourcetype)
    }
  })
  it('test for all whitelist filter to be configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', allwhiteListedFilterQuery)
    if ((allwhiteListedFilterQuery && Object.keys(allwhiteListedFilterQuery).length > 0)) {
      expect(generateJSON.channel).toEqual(allwhiteListedFilterQuery.channel)
      expect(generateJSON.framework).toEqual(allwhiteListedFilterQuery.framework)
      expect(generateJSON.mimeType).toEqual(allwhiteListedFilterQuery.mimeType)
      expect(generateJSON.contentType).toEqual(allwhiteListedFilterQuery.contentType)
      expect(generateJSON.resourceType).toEqual(allwhiteListedFilterQuery.resourceType)
    }
  })
  it('check if whiteListed and blacklisted channel filters is configured', function () {
    // configUtil.setConfig('META_FILTER_REQUEST_JSON', allwhiteListedFilterQuery)
    if ((contentMetaConfig.allowedChannels && (contentMetaConfig.allowedChannels).length > 0) &&
          (contentMetaConfig.blackListedChannels && (contentMetaConfig.blackListedChannels).length > 0)) {
      expect(_.isEqual(generateJSON.channel, channelConf)).toBeTruthy()
      expect(_.isEqual(generateJSON.mimeType, mimeTypeConf)).toBeTruthy()
      expect(_.isEqual(generateJSON.resourceType, resourceTypeConf)).toBeTruthy()
    }
  })
  it('check if whiteListed and blacklisted framework is configured', function () {
    if ((contentMetaConfig.allowedFramework && (contentMetaConfig.allowedFramework).length > 0) &&
    (contentMetaConfig.blacklistedFramework && (contentMetaConfig.blacklistedFramework).length > 0)) {
      expect(_.isEqual(generateJSON.framework, frameworkConf)).toBeTruthy()
    }
  })
  it('check if whiteListed and blacklisted contentType is configured', function () {
    if ((contentMetaConfig.allowedContenttype && (contentMetaConfig.allowedContenttype).length > 0) &&
      (contentMetaConfig.blackListedContenttype && (contentMetaConfig.blackListedContenttype).length > 0)) {
      expect(_.isEqual(generateJSON.contentType, contentTypeConf)).toBeTruthy()
    }
  })
  it('check if whiteListed and blacklisted resourceType is configured', function () {
    if ((contentMetaConfig.allowedResourcetype && (contentMetaConfig.allowedResourcetype).length > 0) &&
      (contentMetaConfig.blackListedResourcetype && (contentMetaConfig.blackListedResourcetype).length > 0)) {
      expect(_.isEqual(generateJSON.resourceType, resourceTypeConf)).toBeTruthy()
    }
  })
  it('check if whiteListed and blacklisted mimeType is configured', function () {
    if ((contentMetaConfig.allowedMimetype && (contentMetaConfig.allowedMimetype).length > 0) &&
      (contentMetaConfig.blackListedMimetype && (contentMetaConfig.blackListedMimetype).length > 0)) {
      expect(_.isEqual(generateJSON.mimeType, mimeTypeConf)).toBeTruthy()
    }
  })
})

describe('Check environment config variables for meta filters for blacklisted filter query', function (done) {
  configUtil.setConfig('META_FILTER_REQUEST_JSON', allblackListedFilterQuery)
  var generateJSON = configUtil.getConfig('META_FILTER_REQUEST_JSON')
  it('check if blackList channel is configured', function () {
    if ((contentMetaConfig.blackListedChannels && contentMetaConfig.blackListedChannels.length > 0)) {
      expect(_.isEqual(generateJSON.channel, {'ne': (contentMetaConfig.blackListedChannels)})).toBeTruthy()
    }
  })
  it('check if blackList framework is configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', allblackListedFilterQuery)
    if ((contentMetaConfig.blacklistedFramework && (contentMetaConfig.blacklistedFramework).length > 0)) {
      expect(generateJSON.framework).toEqual({'ne': (contentMetaConfig.blacklistedFramework)})
    }
  })

  it('check if blackList contentType is configured', function () {
    if ((contentMetaConfig.blackListedContenttype && (contentMetaConfig.blackListedContenttype).length > 0)) {
      expect(generateJSON.contentType).toEqual({'ne': (contentMetaConfig.blackListedContenttype)})
    }
  })

  it('check if blackList mimeType is configured', function () {
    if ((contentMetaConfig.blackListedMimetype && contentMetaConfig.blackListedMimetype.length > 0)) {
      expect(generateJSON.mimeType).toEqual({'ne': (contentMetaConfig.blackListedMimetype)})
    }
  })

  it('check if blackList resourceType is configured', function () {
    if ((contentMetaConfig.blackListedResourcetype && contentMetaConfig.blackListedResourcetype.length > 0)) {
      expect(generateJSON.resourceType).toEqual({'ne': (contentMetaConfig.blackListedResourcetype)})
    }
  })
  it('test for all blacklist filter to be configured', function () {
    // configUtil.setConfig('META_FILTER_REQUEST_JSON', allblackListedFilterQuery)
    if ((allblackListedFilterQuery && Object.keys(allblackListedFilterQuery).length > 0)) {
      expect(generateJSON.channel).toEqual(allblackListedFilterQuery.channel)
      expect(generateJSON.framework).toEqual(allblackListedFilterQuery.framework)
      expect(generateJSON.mimeType).toEqual(allblackListedFilterQuery.mimeType)
      expect(generateJSON.contentType)
        .toEqual(allblackListedFilterQuery.contentType)
      expect(generateJSON.resourceType)
        .toEqual(allblackListedFilterQuery.resourceType)
    }
  })
  it('test for whitelist channel and blackList channel not configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', emptyFilterQuery)
    if (((contentMetaConfig.allowedChannels).length > 0) && ((contentMetaConfig.blackListedChannels).length > 0)) {
      expect(configUtil.getConfig('META_FILTER_REQUEST_JSON')).toEqual({})
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
  it('if contentType, mimeType, resourceType is not configured', function () {
    const chFwfilterQuery = {
      channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
      framework: [ 'NCF' ]
    }
    var metaFiltersArray = {
      'channel': [contentMetaConfig.allowedChannels, contentMetaConfig.blackListedChannels],
      'framework': [contentMetaConfig.allowedFramework, contentMetaConfig.blacklistedFramework],
      'mimeType': [[], []],
      'contentType': [[], []],
      'resourceType': [[], []]
    }

    var generateConfigArray = generateConfigString(metaFiltersArray)
    if (chFwfilterQuery) {
      configUtil.setConfig('META_FILTER_REQUEST_JSON', chFwfilterQuery)
      var generateJSON = configUtil.getConfig('META_FILTER_REQUEST_JSON')
      expect(_.isEqual(generateJSON.channel, generateConfigArray.channel)).toBeTruthy()
      expect(_.isEqual(generateJSON.framework, generateConfigArray.framework)).toBeTruthy()
      expect(generateConfigArray.mimeType).toBeUndefined()
      expect(generateConfigArray.contentType).toBeUndefined()
      expect(generateConfigArray.resourceType).toBeUndefined()
    }
  })
})
