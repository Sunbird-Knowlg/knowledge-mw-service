/**
 * file: healthCheckRoutes.js
 * author: Anuj Gupta
 * desc: route file for health check
 */

var healthService = require('../service/healthCheckService')
var requestMiddleware = require('../middlewares/request.middleware')

module.exports = function (app) {
  app.route('/health')
    .get(requestMiddleware.createAndValidateRequestBody, healthService.checkHealth)
}
