/**
 * file: framework-route.js
 * author: Rajath V B
 * desc: route file for Channel
 */

var frameworkService = require('../service/frameworkService')
var requestMiddleware = require('../middlewares/request.middleware')

var baseUrl = '/v1/framework'

module.exports = function (app) {
  app.route(baseUrl + '/read/:frameworkId')
    .get(requestMiddleware.createAndValidateRequestBody, frameworkService.getFrameworkById)

  app.route(baseUrl + '/list')
    .post(requestMiddleware.createAndValidateRequestBody, frameworkService.frameworklList)

  app.route(baseUrl + '/create')
    .post(requestMiddleware.createAndValidateRequestBody, frameworkService.frameworkCreate)

  app.route(baseUrl + '/update/:frameworkId')
    .patch(requestMiddleware.createAndValidateRequestBody, frameworkService.frameworkUpdate)

  app.route(baseUrl + '/copy/:frameworkId')
    .post(requestMiddleware.createAndValidateRequestBody, frameworkService.frameworkCopy)
  app.route(baseUrl + '/publish/:frameworkId')
    .post(requestMiddleware.createAndValidateRequestBody, frameworkService.frameworkPublish)
}
