/*
var filterService = require('../../service/filterService')
var configUtil = require('../../libs/sb-config-util')

describe('content meta filter service from config', function () {
  it('check for getMetadataFilterQuery method', function () {
    spyOn(configUtil, 'getConfig')
    filterService.getMetadataFilterQuery(function (obj) {})
    expect(configUtil.getConfig).toHaveBeenCalled()
  })
  it('check for whitelisted metafilter set in config', function () {
    // var whiteList = ['in.ekstep', '505c7c48ac6dc1edc9b08f21db5a571d', 'b00bc992ef25f1a9a8d63291e20efc8d']
    var whiteList = {
      channel: ['b00bc992ef25f1a9a8d63291e20efc8d'],
      framework: [ 'NCF' ],
      contentType: [ 'Resource' ],
      mimeType: [ 'application/vnd.ekstep.content-collection' ],
      resourceType: [ 'Learn' ]
    }
    configUtil.setConfig('META_FILTER_REQUEST_JSON', whiteList)
    filterService.getMetadataFilterQuery(function (obj) {})
    expect(configUtil.getConfig('META_FILTER_REQUEST_JSON')).toEqual(whiteList)
  })
  it('check for blacklisted metafilter set in config', function () {
    var blacklist = {
      channel: { ne: ['0124758418460180480', '0124758449502453761'] },
      framework: { ne: [ '01231711180382208027', '012315809814749184151' ] },
      contentType: { ne: [ 'Story' ] },
      mimeType: { ne: [ 'application/vnd.ekstep.h5p-archive' ] },
      resourceType: { ne: [ 'Read' ] }
    }
    configUtil.setConfig('META_FILTER_REQUEST_JSON', blacklist)
    filterService.getMetadataFilterQuery(function (obj) {})
    expect(configUtil.getConfig('META_FILTER_REQUEST_JSON')).toEqual(blacklist)
  })
})
*/
