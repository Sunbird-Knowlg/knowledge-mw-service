/**
 * file: framework-route.js
 * author: Rajath V B
 * desc: route file for Channel
 */

var frameworkService = require('../service/frameworkService')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL_V1_Framework = '/v1/framework'

module.exports = function (app) {
  app.route(BASE_URL_V1_Framework + '/read/:frameworkId')
    .get(requestMiddleware.createAndValidateRequestBody, frameworkService.getFrameworkById)

  app.route(BASE_URL_V1_Framework + '/list')
    .post(requestMiddleware.createAndValidateRequestBody, frameworkService.frameworklList)

  app.route(BASE_URL_V1_Framework + '/create')
    .post(requestMiddleware.createAndValidateRequestBody, frameworkService.frameworkCreate)

  app.route(BASE_URL_V1_Framework + '/update/:frameworkId')
    .patch(requestMiddleware.createAndValidateRequestBody, frameworkService.frameworkUpdate)
    
  app.route(BASE_URL_V1_Framework + '/copy/:frameworkId')
    .post(requestMiddleware.createAndValidateRequestBody, frameworkService.frameworkCopy)
}
