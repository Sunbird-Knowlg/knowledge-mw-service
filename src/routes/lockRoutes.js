/**
 * file: lock-route.js
 * author: Sourav Dey
 * desc: route file for locking resources
 */

var lockService = require('../service/lockService')
var requestMiddleware = require('../middlewares/request.middleware')
var healthService = require('../service/healthCheckService')

var BASE_URL = '/v1/lock'
var dependentServiceHealth = ['EKSTEP', 'CASSANDRA']

module.exports = function (app) {
  app.route(BASE_URL + '/create')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      lockService.createLock)

  app.route(BASE_URL + '/refresh')
    .patch(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      lockService.refreshLock)

  app.route(BASE_URL + '/retire')
    .delete(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      lockService.retireLock)

  app.route(BASE_URL + '/list')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody,
      lockService.listLock)
}
