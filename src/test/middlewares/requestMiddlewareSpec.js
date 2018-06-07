/**
 * @name : requestMiddleware.js
 * @description :: Responsible for test request.middleware.js
 * @author      :: Rajeev
 **/
var requestMiddleware = require('../../middlewares/request.middleware')
var filterService = require('../../service/filterService')

var req = {
  'body': {
    'request': {
      'filters': {
        'channel': 'in.ekstep'
      }
    }
  }
}
describe('filter of channels', function () {
  it('check if request is there then do next', function () {
    requestMiddleware.addChannelFilters(req, {}, function (obj) {
      expect(obj.body.request.filters.channel).toMatch('in.ekstep')
    })
  })
  it('check for no request and get config', function () {
    spyOn(filterService, 'getChannelSearchString')
    requestMiddleware.addChannelFilters({}, {}, function (req) {})
    expect(filterService.getChannelSearchString).toHaveBeenCalled()
  })
})
