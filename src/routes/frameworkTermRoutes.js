/**
 * file: frameworkTerm-route.js
 * author: Rajath V B
 * desc: route file for Channel
 */

var frameworkTermService = require('../service/frameworkTermService')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL_V1_Framework_Term = '/v1/framework/term'

module.exports = function (app) {
  app.route(BASE_URL_V1_Framework_Term + '/read/:categoryID')
    .get(requestMiddleware.createAndValidateRequestBody, frameworkTermService.getFrameworkTerm)

  app.route(BASE_URL_V1_Framework_Term + '/search')
    .post(requestMiddleware.createAndValidateRequestBody, frameworkTermService.frameworkTermSearch)

  app.route(BASE_URL_V1_Framework_Term + '/create')
    .post(requestMiddleware.createAndValidateRequestBody, frameworkTermService.frameworkTermCreate)

  app.route(BASE_URL_V1_Framework_Term + '/update/:categoryID')
    .patch(requestMiddleware.createAndValidateRequestBody, frameworkTermService.frameworkTermUpdate)
}
