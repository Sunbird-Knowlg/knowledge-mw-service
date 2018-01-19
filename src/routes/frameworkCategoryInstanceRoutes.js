/**
 * file: frameworkCategoryInstance-route.js
 * author: Rajath V B
 * desc: route file for Channel
 */

var frameworkCategoryInstanceService = require('../service/frameworkCategoryInstanceService')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL_V1_Framework_Category = '/v1/framework/category'

module.exports = function (app) {
  app.route(BASE_URL_V1_Framework_Category + '/read/:categoryID')
    .get(requestMiddleware.createAndValidateRequestBody, frameworkCategoryInstanceService.getFrameworkCategoryInstance)

  app.route(BASE_URL_V1_Framework_Category + '/search')
    .post(requestMiddleware.createAndValidateRequestBody, frameworkCategoryInstanceService.frameworkCategoryInstanceSearch)

  app.route(BASE_URL_V1_Framework_Category + '/create')
    .post(requestMiddleware.createAndValidateRequestBody, frameworkCategoryInstanceService.frameworkCategoryInstanceCreate)

  app.route(BASE_URL_V1_Framework_Category + '/update/:categoryID')
    .patch(requestMiddleware.createAndValidateRequestBody, frameworkCategoryInstanceService.frameworkCategoryInstanceUpdate)
}
