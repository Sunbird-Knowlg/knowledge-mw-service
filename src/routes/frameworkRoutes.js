/**
 * file: framework-route.js
 * author: Rajath V B
 * desc: route file for Channel
 */

var frameworkService = require('../service/frameworkService')
var requestMiddleware = require('../middlewares/request.middleware')
var filterMiddleware = require('../middlewares/filter.middleware')
var healthService = require('../service/healthCheckService')

var baseUrl = '/v1/framework'
var dependentServiceHealth = ['EKSTEP']

module.exports = function (app) {
  app.route(baseUrl + '/read/:frameworkId')
    .get(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, frameworkService.getFrameworkById)

  app.route(baseUrl + '/list')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, filterMiddleware.addMetaFilters,
      frameworkService.frameworklList)

  app.route(baseUrl + '/create')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, frameworkService.frameworkCreate)

  app.route(baseUrl + '/update/:frameworkId')
    .patch(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, frameworkService.frameworkUpdate)

  app.route(baseUrl + '/copy/:frameworkId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, frameworkService.frameworkCopy)

  app.route(baseUrl + '/publish/:frameworkId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, frameworkService.frameworkPublish)
}
