var channelFilterRoutes = [
  'content/search',
  'course/search',
  'framework/category/search',
  'framework/term/search',
  'search',
  'framework/list'
]

var requestMiddleware = require('../middlewares/request.middleware')
var httpMocks = require('node-mocks-http')

var baseUrl = 'http://localhost:5000/v1/'
var async = require('async')
var _ = require('underscore')

// TODO to fix, if this test case running correctly depends on environment.

const whiteListedChannelList = process.env.sunbird_content_service_whitelisted_channels
const blackListedChannelList = process.env.sunbird_content_service_blacklisted_channels
var whiteListQuery = whiteListedChannelList ? whiteListedChannelList.split(',') : []
var blackListedChannelListNew = blackListedChannelList ? blackListedChannelList.split(',') : []
var blackListQuery = {'ne': (blackListedChannelListNew)}

describe('Check for all route to be calling the AddChannelFilter', function () {
  async.forEach(channelFilterRoutes, function (route, callback) {
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
      it('check for filter in config with ' + route, function () {
        requestMiddleware.addChannelFilters(req, res, function next () {
          expect(req.body.request.filters.channel).toBeDefined()
        })
      })
      it('check for filter in config with value ' + route, function () {
        requestMiddleware.addChannelFilters(req, res, function next () {
          if ((whiteListQuery && whiteListQuery.length > 0) &&
          (blackListedChannelListNew && blackListedChannelListNew.length > 0)) {
            var searchQuery = _.difference(whiteListQuery, blackListedChannelListNew)
            expect(req.body.request.filters.channel).toEqual(searchQuery)
          } else if (whiteListQuery && whiteListQuery.length > 0) {
            expect(req.body.request.filters.channel).toEqual(whiteListQuery)
          } else if (blackListedChannelListNew && blackListedChannelListNew.length > 0) {
            expect(req.body.request.filters.channel).toEqual(blackListQuery)
          }
        })
      })
    })
  })
})
