/**
 * file: frameworkTerm-route.js
 * author: Rajath V B
 * desc: route file for Channel
 */

var frameworkTermService = require('../service/frameworkTermService')
var requestMiddleware = require('../middlewares/request.middleware')

var baseUrl = '/v1/framework/term'

module.exports = function (app) {
  app.route(baseUrl + '/read/:categoryID')
    .get(requestMiddleware.createAndValidateRequestBody, frameworkTermService.getFrameworkTerm)

  app.route(baseUrl + '/search')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.addChannelFilters,
      frameworkTermService.frameworkTermSearch)

  app.route(baseUrl + '/create')
    .post(requestMiddleware.createAndValidateRequestBody, frameworkTermService.frameworkTermCreate)

  app.route(baseUrl + '/update/:categoryID')
    .patch(requestMiddleware.createAndValidateRequestBody, frameworkTermService.frameworkTermUpdate)
}
