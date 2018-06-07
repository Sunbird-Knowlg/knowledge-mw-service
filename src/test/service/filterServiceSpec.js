var filterService = require('../../service/filterService')
var configUtil = require('../../libs/sb-config-util')

describe('filter service', function () {
  it('check for getChannelSearchString method', function () {
    spyOn(configUtil, 'getConfig')
    filterService.getChannelSearchString(function (obj) {})
    expect(configUtil.getConfig).toHaveBeenCalled()
  })
})
