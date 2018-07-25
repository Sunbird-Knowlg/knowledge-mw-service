var configUtil = require('../libs/sb-config-util')
var _ = require('lodash')

var contentMetaConfig = require('./contentMetaConfig')

var allowedChannels = contentMetaConfig.allowedChannels
var blackListedChannels = contentMetaConfig.blackListedChannels

var allowedFramework = contentMetaConfig.allowedFramework
var blackListedFramework = contentMetaConfig.blacklistedFrameworkList

var allowedMimetype = contentMetaConfig.allowedMimetype
var blackListedMimetype = contentMetaConfig.blackListedMimetype

var allowedContenttype = contentMetaConfig.allowedContenttype
var blackListedContenttype = contentMetaConfig.blackListedContenttype

var allowedResourcetype = contentMetaConfig.allowedResourcetype
var blackListedResourcetype = contentMetaConfig.blackListedResourcetype
var blackListQuery = {'ne': (blackListedChannels)}
var blackListFrameworkQuery = {'ne': (blackListedFramework)}
var blackListMimetypeQuery = {'ne': (blackListedMimetype)}
var blackListContenttypeQuery = {'ne': (blackListedContenttype)}
var blackListResourcetypeQuery = {'ne': (blackListedResourcetype)}

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
  'channel': [allowedChannels, blackListedChannels],
  'framework': [allowedFramework, blackListedFramework],
  'mimeType': [allowedMimetype, blackListedMimetype],
  'contentType': [allowedContenttype, blackListedContenttype],
  'resourceType': [allowedResourcetype, blackListedResourcetype]
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
    if ((allowedChannels && allowedChannels.length > 0)) {
      expect(generateJSON.channel).toEqual(allowedChannels)
    }
  })
  it('check if whiteListed framework is configured', function () {
    if ((allowedFramework && allowedFramework.length > 0)) {
      expect(generateJSON.framework).toEqual(allowedFramework)
    }
  })
  it('check if whiteListed contentType is configured', function () {
    if ((allowedContenttype && allowedContenttype.length > 0)) {
      expect(generateJSON.contentType).toEqual(allowedContenttype)
    }
  })
  it('check if whiteListed mimeType is configured', function () {
    if ((allowedMimetype && allowedMimetype.length > 0)) {
      expect(generateJSON.mimeType).toEqual(allowedMimetype)
    }
  })
  it('check if whiteListed resourceType is configured', function () {
    if ((allowedResourcetype && allowedResourcetype.length > 0)) {
      expect(generateJSON.resourceType).toEqual(allowedResourcetype)
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
    if ((allowedChannels && allowedChannels.length > 0) &&
          (blackListedChannels && blackListedChannels.length > 0)) {
      expect(_.isEqual(generateJSON.channel, channelConf)).toBeTruthy()
      expect(_.isEqual(generateJSON.mimeType, mimeTypeConf)).toBeTruthy()
      expect(_.isEqual(generateJSON.resourceType, resourceTypeConf)).toBeTruthy()
    }
  })
  it('check if whiteListed and blacklisted framework is configured', function () {
    if ((allowedFramework && allowedFramework.length > 0) && (blackListedFramework &&
        blackListedFramework.length > 0)) {
      expect(_.isEqual(generateJSON.framework, frameworkConf)).toBeTruthy()
    }
  })
  it('check if whiteListed and blacklisted contentType is configured', function () {
    if ((allowedContenttype && allowedContenttype.length > 0) &&
      (blackListedContenttype && blackListedContenttype.length > 0)) {
      expect(_.isEqual(generateJSON.contentType, contentTypeConf)).toBeTruthy()
    }
  })
  it('check if whiteListed and blacklisted resourceType is configured', function () {
    if ((allowedResourcetype && allowedResourcetype.length > 0) &&
      (blackListedResourcetype && blackListedResourcetype.length > 0)) {
      expect(_.isEqual(generateJSON.resourceType, resourceTypeConf)).toBeTruthy()
    }
  })
  it('check if whiteListed and blacklisted mimeType is configured', function () {
    if ((allowedMimetype && allowedMimetype.length > 0) &&
      (blackListedMimetype && blackListedMimetype.length > 0)) {
      expect(_.isEqual(generateJSON.mimeType, mimeTypeConf)).toBeTruthy()
    }
  })
})

describe('Check environment config variables for meta filters for blacklisted filter query', function (done) {
  configUtil.setConfig('META_FILTER_REQUEST_JSON', allblackListedFilterQuery)
  var generateJSON = configUtil.getConfig('META_FILTER_REQUEST_JSON')
  it('check if blackList channel is configured', function () {
    if ((blackListedChannels && blackListedChannels.length > 0)) {
      expect(_.isEqual(generateJSON.channel, blackListQuery)).toBeTruthy()
    }
  })
  it('check if blackList framework is configured', function () {
    configUtil.setConfig('META_FILTER_REQUEST_JSON', allblackListedFilterQuery)
    if ((blackListedFramework && blackListedFramework.length > 0)) {
      expect(generateJSON.framework).toEqual(blackListFrameworkQuery)
    }
  })

  it('check if blackList contentType is configured', function () {
    if ((blackListedContenttype && blackListedContenttype.length > 0)) {
      expect(generateJSON.contentType).toEqual(blackListContenttypeQuery)
    }
  })

  it('check if blackList mimeType is configured', function () {
    if ((blackListedMimetype && blackListedMimetype.length > 0)) {
      expect(generateJSON.mimeType).toEqual(blackListMimetypeQuery)
    }
  })

  it('check if blackList resourceType is configured', function () {
    if ((blackListedResourcetype && blackListedResourcetype.length > 0)) {
      expect(generateJSON.resourceType).toEqual(blackListResourcetypeQuery)
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
    if ((allowedChannels.length > 0) && (blackListedChannels.length > 0)) {
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
    allowedMimetype = []
    blackListedMimetype = []
    allowedContenttype = []
    blackListedContenttype = []
    allowedResourcetype = []
    blackListedResourcetype = []

    var metaFiltersArray = {
      'channel': [allowedChannels, blackListedChannels],
      'framework': [allowedFramework, blackListedFramework],
      'mimeType': [allowedMimetype, blackListedMimetype],
      'contentType': [allowedContenttype, blackListedContenttype],
      'resourceType': [allowedResourcetype, blackListedResourcetype]
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
