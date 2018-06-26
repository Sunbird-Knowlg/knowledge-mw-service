/**
 * @name : requestMiddleware.js
 * @description :: Responsible for test request.middleware.js
 * @author      :: Rajeev
 **/
var requestMiddleware = require('../../middlewares/request.middleware')
var filterService = require('../../service/filterService')
var configUtil = require('../../libs/sb-config-util')

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
    var whiteList = ['in.ekstep', '505c7c48ac6dc1edc9b08f21db5a571d', 'b00bc992ef25f1a9a8d63291e20efc8d']
    configUtil.setConfig('CHANNEL_FILTER_QUERY_STRING', whiteList)
    requestMiddleware.addChannelFilters(req1, {}, function () {
      expect(req1.body.request.filters.channel).toEqual(whiteList)
    })
  })
  it('check for getChannelSearchString method creates proper blacklisted search string', function () {
    var blacklist = {'ne': ['in.ekstep', '505c7c48ac6dc1edc9b08f21db5a571d', 'b00bc992ef25f1a9a8d63291e20efc8d']}
    configUtil.setConfig('CHANNEL_FILTER_QUERY_STRING', blacklist)
    requestMiddleware.addChannelFilters(req1, {}, function () {
      expect(req1.body.request.filters.channel).toEqual(blacklist)
    })
  })
})
