var configHelper = require('../../helpers/configHelper')

describe('configuration helper methods', function () {
  it('should set the configuration ', function () {
    spyOn(configHelper, 'getFilterConfig')
    configHelper.updateConfig()
    expect(configHelper.getFilterConfig).toHaveBeenCalled()
  })
})
describe('configuration string', function () {
  it('should return the config string with all channels when $.instance.all is present', function (done) {
    process.env.sunbird_content_service_whitelisted_channels =
    '505c7c48ac6dc1edc9b08f21db5a571d,b00bc992ef25f1a9a8d63291e20efc8d,$.instance.all'
    process.env.sunbird_content_service_blacklisted_channels = 'b00bc992ef25f1a9a8d63291e20efc8d'
    configHelper.getFilterConfig().then(function (configStr) {
      expect(configStr.length).toBeGreaterThanOrEqual(process.env.sunbird_content_service_whitelisted_channels.length)
      done()
    })
  })
  it('should return the config string with whitelisted channels', function (done) {
    process.env.sunbird_content_service_whitelisted_channels =
    '505c7c48ac6dc1edc9b08f21db5a571d,b00bc992ef25f1a9a8d63291e20efc8d'
    process.env.sunbird_content_service_blacklisted_channels = 'b00bc992ef25f1a9a8d63291e20efc8d'
    configHelper.getFilterConfig().then(function (configStr) {
      expect(configStr.length).toBeLessThanOrEqual(process.env.sunbird_content_service_whitelisted_channels.length)
      done()
    })
  })
})
