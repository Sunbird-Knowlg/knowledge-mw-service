var filterService = require('../../service/filterService')
var configUtil = require('../../libs/sb-config-util')

describe('filter service', function () {
  it('check for getChannelSearchString method', function () {
    spyOn(configUtil, 'getConfig')
    filterService.getChannelSearchString(function (obj) {})
    expect(configUtil.getConfig).toHaveBeenCalled()
  })
  it('check for whitelist chanel set in config', function () {
    var whiteList = ['in.ekstep', '505c7c48ac6dc1edc9b08f21db5a571d', 'b00bc992ef25f1a9a8d63291e20efc8d']
    configUtil.setConfig('CHANNEL_FILTER_QUERY_STRING', whiteList)
    filterService.getChannelSearchString(function (obj) {})
    expect(configUtil.getConfig('CHANNEL_FILTER_QUERY_STRING')).toEqual(whiteList)
  })
  it('check for blacklist chanel set in config', function () {
    var blacklist = {'ne': ['in.ekstep', '505c7c48ac6dc1edc9b08f21db5a571d', 'b00bc992ef25f1a9a8d63291e20efc8d']}
    configUtil.setConfig('CHANNEL_FILTER_QUERY_STRING', blacklist)
    filterService.getChannelSearchString(function (obj) {})
    expect(configUtil.getConfig('CHANNEL_FILTER_QUERY_STRING')).toEqual(blacklist)
  })
})
