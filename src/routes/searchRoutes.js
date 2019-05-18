/**
 * file: search-route.js
 * author: Anuj Gupta
 * desc: route file for content
 */

var contentService = require('../service/contentService')
var requestMiddleware = require('../middlewares/request.middleware')
var filterMiddleware = require('../middlewares/filter.middleware')
var healthService = require('../service/healthCheckService')

var BASE_URL_V1 = '/v1'
var dependentServiceHealth = ['EKSTEP']

module.exports = function (app) {
  app.route(BASE_URL_V1 + '/search')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, filterMiddleware.addMetaFilters,
      contentService.searchAPI)
}
