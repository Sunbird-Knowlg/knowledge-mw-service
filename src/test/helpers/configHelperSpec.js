var configHelper = require('../../helpers/configHelper')
var configUtil = require('sb-config-util')

describe('configuration settings', function () {
  it('should set the configuration ', function (done) {
    configHelper.updateConfig()
    expect(configUtil.getConfig('CHANNEL_FILTER_QUERY_STRING')).toEqual([])
    done()
  })
})
describe('configuration string', function () {
  it('should return the config string with all channels', function (done) {
    process.env.sunbird_content_service_whitelisted_channels =
    '505c7c48ac6dc1edc9b08f21db5a571d,b00bc992ef25f1a9a8d63291e20efc8d,$.instance.all'
    process.env.sunbird_content_service_blacklisted_channels = 'b00bc992ef25f1a9a8d63291e20efc8d'
    configHelper.getFilterConfig(function (err, configStr) {
      expect(err).toBeNull()
      expect(configStr.length).toBeGreaterThanOrEqual(process.env.sunbird_content_service_whitelisted_channels.length)
      done()
    })
  })
  it('should return the config string with whitelisted channels', function (done) {
    process.env.sunbird_content_service_whitelisted_channels =
    '505c7c48ac6dc1edc9b08f21db5a571d,b00bc992ef25f1a9a8d63291e20efc8d'
    process.env.sunbird_content_service_blacklisted_channels = 'b00bc992ef25f1a9a8d63291e20efc8d'
    configHelper.getFilterConfig(function (err, configStr) {
      expect(err).toBeNull()
      expect(configStr.length).toBeLessThanOrEqual(process.env.sunbird_content_service_whitelisted_channels.length)
      done()
    })
  })
})
