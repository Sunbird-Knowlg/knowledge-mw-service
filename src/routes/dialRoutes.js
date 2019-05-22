/**
 * file: dialRoutes.js
 * author: Rayulu Villa
 * desc: routes for DIAL APIs
 */

var pageService = require('../service/dialAssembleService')
var requestMiddleware = require('../middlewares/request.middleware')
var healthService = require('../service/healthCheckService')

var BASE_URL_V1_channel = '/v1/dial'
var dependentServiceHealth = ['EKSTEP']

module.exports = function (app) {
  app.route(BASE_URL_V1_channel + '/assemble')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, pageService.assemble)
}
