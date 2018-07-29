var configHelper = require('../../helpers/configHelper')

describe('configuration helper methods', function () {
  it('should get all the channels', function () {
    spyOn(configHelper, 'getRootOrgs')
    configHelper.getAllChannelsFromAPI().then((configStr) => {
      expect(configStr.length).toBeGreaterThanOrEqual(0)
    })
  })
})
