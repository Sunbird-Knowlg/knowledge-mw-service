/**
 * file: lock-route.js
 * author: Sourav Dey
 * desc: route file for locking resources
 */

var lockService = require('../service/lockService')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL = '/v1/lock'

module.exports = function (app) {
  app.route(BASE_URL + '/create')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      lockService.createLock)

  app.route(BASE_URL + '/refresh')
    .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      lockService.refreshLock)

  app.route(BASE_URL + '/retire')
    .delete(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      lockService.retireLock)

  app.route(BASE_URL + '/list')
    .post(requestMiddleware.createAndValidateRequestBody,
      lockService.listLock)
}
