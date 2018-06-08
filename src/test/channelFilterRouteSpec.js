var routes = [
  'content/search',
  'course/search',
  'framework/category/search',
  'framework/term/search',
  'search'
]

var requestMiddleware = require('../middlewares/request.middleware')
var httpMocks = require('node-mocks-http')

var baseUrl = 'http://localhost:5000/v1/'
var async = require('async')

describe('Check', function () {
  async.forEach(routes, function (route, callback) {
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
      it('check for filter in config with ', function () {
        requestMiddleware.addChannelFilters(req, res, function next () {
          expect(req.body.request.filters.channel).toBeDefined()
        })
      })
    })
  })
})
