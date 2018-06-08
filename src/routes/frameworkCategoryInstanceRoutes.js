/**
 * file: frameworkCategoryInstance-route.js
 * author: Rajath V B
 * desc: route file for Channel
 */

var frameworkCategoryInstanceService = require('../service/frameworkCategoryInstanceService')
var requestMiddleware = require('../middlewares/request.middleware')

var baseUrl = '/v1/framework/category'

module.exports = function (app) {
  app.route(baseUrl + '/read/:categoryID')
    .get(requestMiddleware.createAndValidateRequestBody, frameworkCategoryInstanceService.getFrameworkCategoryInstance)

  app.route(baseUrl + '/search')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.addChannelFilters,
      frameworkCategoryInstanceService.frameworkCategoryInstanceSearch)

  app.route(baseUrl + '/create')
    .post(requestMiddleware.createAndValidateRequestBody,
      frameworkCategoryInstanceService.frameworkCategoryInstanceCreate)

  app.route(baseUrl + '/update/:categoryID')
    .patch(requestMiddleware.createAndValidateRequestBody,
      frameworkCategoryInstanceService.frameworkCategoryInstanceUpdate)
}
