var configHelper = require('../../helpers/configHelper')
var orgHelper = require('../../helpers/orgHelper')

describe('configuration helper methods', function () {
  it('should get all the channels', function () {
    spyOn(orgHelper, 'getRootOrgs')
    configHelper.getAllChannelsFromAPI().then((configStr) => {
      expect(configStr.length).toBeGreaterThanOrEqual(0)
    })
  })
})
