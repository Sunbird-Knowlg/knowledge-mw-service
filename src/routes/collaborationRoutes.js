/**
 * file: collaborators-route.js
 * author: Sourav Dey
 * desc: route file for collaborators
 */

var collaboratorService = require('../service/collaboratorService')
var requestMiddleware = require('../middlewares/request.middleware')
var healthService = require('../service/healthCheckService')

var BASE_URL = '/v1/content'
var dependentServiceHealth = ['EKSTEP']

module.exports = function (app) {
  app.route(BASE_URL + '/collaborator/update/:contentId')
    .patch(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForCreatorUser, collaboratorService.updateCollaborators)
}
