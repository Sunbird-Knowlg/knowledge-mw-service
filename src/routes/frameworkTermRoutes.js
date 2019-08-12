/**
 * file: frameworkTerm-route.js
 * author: Rajath V B
 * desc: route file for Channel
 */

var frameworkTermService = require('../service/frameworkTermService')
var requestMiddleware = require('../middlewares/request.middleware')
var filterMiddleware = require('../middlewares/filter.middleware')
var healthService = require('../service/healthCheckService')

var baseUrl = '/v1/framework/term'
var dependentServiceHealth = ['EKSTEP']

module.exports = function (app) {
  app.route(baseUrl + '/read/:categoryID')
    .get(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, frameworkTermService.getFrameworkTerm)

  app.route(baseUrl + '/search')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, filterMiddleware.addMetaFilters,
      frameworkTermService.frameworkTermSearch)

  app.route(baseUrl + '/create')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, frameworkTermService.frameworkTermCreate)

  app.route(baseUrl + '/update/:categoryID')
    .patch(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, frameworkTermService.frameworkTermUpdate)
}
