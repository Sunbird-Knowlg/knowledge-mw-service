/**
 * file: frameworkCategoryInstance-route.js
 * author: Rajath V B
 * desc: route file for Channel
 */

var frameworkCategoryInstanceService = require('../service/frameworkCategoryInstanceService')
var requestMiddleware = require('../middlewares/request.middleware')
var filterMiddleware = require('../middlewares/filter.middleware')
var healthService = require('../service/healthCheckService')

var baseUrl = '/v1/framework/category'
var dependentServiceHealth = ['EKSTEP']

module.exports = function (app) {
  app.route(baseUrl + '/read/:categoryID')
    .get(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, frameworkCategoryInstanceService.getFrameworkCategoryInstance)

  app.route(baseUrl + '/search')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, filterMiddleware.addMetaFilters,
      frameworkCategoryInstanceService.frameworkCategoryInstanceSearch)

  app.route(baseUrl + '/create')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody,
      frameworkCategoryInstanceService.frameworkCategoryInstanceCreate)

  app.route(baseUrl + '/update/:categoryID')
    .patch(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody,
      frameworkCategoryInstanceService.frameworkCategoryInstanceUpdate)
}
