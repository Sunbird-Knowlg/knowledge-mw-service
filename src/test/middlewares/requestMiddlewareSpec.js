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
var req1 = {
  'body': {
    'request': {
      'filters': {
      }
    }
  }
}

describe('filter of channels', function () {
  it('check if request is there then do next', function () {
    requestMiddleware.addChannelFilters(req, {}, function () {
      expect(req.body.request.filters.channel).toMatch('in.ekstep')
    })
  })
  it('check for no request and get config', function () {
    spyOn(filterService, 'getChannelSearchString')
    requestMiddleware.addChannelFilters(req1, {}, function () {})
    expect(filterService.getChannelSearchString).toHaveBeenCalled()
  })
  it('check for getChannelSearchString method creates proper whitelisted search string', function () {
    var whiteListQuery = (process.env.sunbird_content_service_whitelisted_channels).split(',')
    requestMiddleware.addChannelFilters(req1, {}, function () {
      expect(req1.body.request.filters.channel).toEqual(whiteListQuery)
    })
  })
  it('check for getChannelSearchString method creates proper blacklisted search string', function () {
    var blackListQuery = {'ne': ((process.env.sunbird_content_service_blacklisted_channels).split(','))}
    var whiteListQuery = (process.env.sunbird_content_service_whitelisted_channels).split(',')
    requestMiddleware.addChannelFilters(req1, {}, function () {
      if (!whiteListQuery && blackListQuery) {
        expect(req1.body.request.filters.channel).toEqual(blackListQuery)
      }
    })
  })
})
