// const express = require('express')
var configUtil = require('../libs/sb-config-util')
var _ = require('underscore')

const metaFilterRoutes = [
  'content/search',
  'course/search',
  'framework/category/search',
  'framework/term/search',
  'search',
  'framework/list'
]

const nonFilterRoutes = [
  'xyz',
  'abc'
]

var filterMiddleware = require('../middlewares/filter.middleware')
var httpMocks = require('node-mocks-http')

var baseUrl = 'http://localhost:5000/v1/'
var async = require('async')

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
var blackListedChannels = blackListedChannelList ? blackListedChannelList.split(',') : []

var allowedFramework = whitelistedFrameworkList ? whitelistedFrameworkList.split(',') : []
var blackListedFramework = blacklistedFrameworkList ? blacklistedFrameworkList.split(',') : []
var allowedMimetype = whitelistedMimeTypeList ? whitelistedMimeTypeList.split(',') : []
var blackListedMimetype = blacklistedMimeTypeList ? blacklistedMimeTypeList.split(',') : []

var allowedContenttype = whitelistedContentTypeList ? whitelistedContentTypeList.split(',') : []
var blackListedContenttype = blacklistedContentTypeList ? blacklistedContentTypeList.split(',') : []

var allowedResourcetype = whitelistedResourceTypeList ? whitelistedResourceTypeList.split(',') : []
var blackListedResourcetype = blacklistedResourceTypeList ? blacklistedResourceTypeList.split(',') : []

var channelConf = generateConfigString(allowedChannels, blackListedChannels)
var frameworkConf = generateConfigString(allowedFramework, blackListedFramework)
var mimeTypeConf = generateConfigString(allowedMimetype, blackListedMimetype)
var contentTypeConf = generateConfigString(allowedContenttype, blackListedContenttype)
var resourceTypeConf = generateConfigString(allowedResourcetype, blackListedResourcetype)

var generateJSON = {
  channel: channelConf,
  framework: frameworkConf,
  contentType: contentTypeConf,
  mimeType: mimeTypeConf,
  resourceType: resourceTypeConf
}

var configString = {}
function generateConfigString (allowedMetadata, blackListedMetadata) {
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

describe('Check for all required route to call the AddMetaFilter', function () {
  async.forEach(metaFilterRoutes, function (route, callback) {
    describe('Composite search services', function () {
      var req, res
      var body = {
        'request': {
          'query': 'Test',
          'filters': {}
        }
      }

      beforeEach(function (done) {
        req = httpMocks.createRequest({
          method: 'POST',
          uri: baseUrl + route,
          body: body
        })

        res = httpMocks.createResponse()

        done() // call done so that the next test can run
      })
      it('check for filter in config with route', function () {
        filterMiddleware.addMetaFilters(req, res, function next () {
          expect(req.body.request.filters).toBeDefined()
        })
      })
      it('check for filter in config with value' + route, function () {
        const allwhiteListedFilterQuery = {
          channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
          framework: [ 'NCF' ],
          contentType: [ 'Resource' ],
          mimeType: [ 'application/vnd.ekstep.content-collection' ],
          resourceType: [ 'Learn' ]
        }
        configUtil.setConfig('META_FILTER_REQUEST_JSON', allwhiteListedFilterQuery)

        filterMiddleware.addMetaFilters(req, res, function next () {
          var filterQuery = generateJSON

          // channels
          if (allowedChannels && allowedChannels.length > 0 && blackListedChannels && blackListedChannels.length > 0) {
            expect(req.body.request.filters.channel).toEqual(filterQuery.channel)
          } else if (allowedChannels && allowedChannels.length > 0) {
            expect(req.body.request.filters.channel).toEqual(allowedChannels)
          } else if (blackListedChannels && blackListedChannels.length > 0) {
            expect(req.body.request.filters.channel).toEqual(blackListedChannels)
          }

          // framework
          if (allowedFramework && allowedFramework.length > 0 && blackListedFramework &&
            blackListedFramework.length > 0) {
            expect(req.body.request.filters.framework).toEqual(filterQuery.framework)
          } else if (allowedFramework && allowedFramework.length > 0) {
            expect(req.body.request.filters.framework).toEqual(allowedFramework)
          } else if (blackListedFramework && blackListedFramework.length > 0) {
            expect(req.body.request.filters.framework).toEqual(blackListedFramework)
          }

          // contentType
          if (allowedContenttype && blackListedContenttype) {
            expect(req.body.request.filters.contentType).toEqual(filterQuery.contentType)
          } else if (allowedContenttype && allowedContenttype.length > 0) {
            expect(req.body.request.filters.contentType).toEqual(allowedContenttype)
          } else if (blackListedContenttype && blackListedContenttype.length > 0) {
            expect(req.body.request.filters.contentType).toEqual(blackListedContenttype)
          }

          // mimeType
          if (allowedMimetype && blackListedMimetype) {
            expect(req.body.request.filters.mimeType).toEqual(filterQuery.mimeType)
          } else if (allowedMimetype && allowedMimetype.length > 0) {
            expect(req.body.request.filters.mimeType).toEqual(allowedMimetype)
          } else if (blackListedMimetype && blackListedMimetype.length > 0) {
            expect(req.body.request.filters.mimeType).toEqual(blackListedMimetype)
          }

          // resourceType
          if (allowedResourcetype && blackListedResourcetype) {
            expect(req.body.request.filters.resourceType).toEqual(filterQuery.resourceType)
          } else if (allowedResourcetype && allowedResourcetype.length > 0) {
            expect(req.body.request.filters.resourceType).toEqual(allowedResourcetype)
          } else if (blackListedResourcetype && blackListedResourcetype.length > 0) {
            expect(req.body.request.filters.resourceType).toEqual(blackListedResourcetype)
          }
        })
      })
    })
  })
})
describe('Check for routes not to call the AddMetaFilter', function () {
  // it('if framework filter calls the route, addMetaFilter should not be called ', function () {
  async.forEach(nonFilterRoutes, function (route, callback) {
    describe('Composite search services for non filters', function (done) {
      var req
      var body = {
        'request': {
          'query': 'Test',
          'filters': {}
        }
      }
      beforeEach(function (done) {
        req = httpMocks.createRequest({
          method: 'POST',
          uri: baseUrl + route,
          body: body
        })

        done()
      })
      it('if framework filter calls the route, addMetaFilter should not be called  ' + route, function () {
        const allwhiteListedFilterQuery = {
          channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
          framework: [ 'NCF' ],
          contentType: [ 'Resource' ],
          mimeType: [ 'application/vnd.ekstep.content-collection' ],
          resourceType: [ 'Learn' ]
        }
        configUtil.setConfig('META_FILTER_REQUEST_JSON', allwhiteListedFilterQuery)
        expect(!_.includes(metaFilterRoutes, route)).toBeTruthy()
        expect(req.body.request.filters).toEqual({})
      })
    })
  })
})
