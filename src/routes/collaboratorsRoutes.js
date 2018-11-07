/**
 * file: collaborators-route.js
 * author: Sourav Dey
 * desc: route file for collaborators
 */

var collaboratorService = require('../service/collaboratorService')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL = '/v1/content'

module.exports = function (app) {
  app.route(BASE_URL + '/collaborate/update/:contentId')
    .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForCreatorUser, collaboratorService.updateCollaborators)
}
