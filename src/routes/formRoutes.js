
/**
 * file: formRoutes.js
 * author: Harish Kumar Gangula
 * desc: route file for form service
 */

var formService = require('../service/formService')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL = '/v1/data/form'

module.exports = function (app) {
  app.route(BASE_URL + '/read')
    .post(requestMiddleware.gzipCompression(), requestMiddleware.createAndValidateRequestBody,
      formService.getFormRequest)
  app.route(BASE_URL + '/update')
    .post(requestMiddleware.gzipCompression(), requestMiddleware.createAndValidateRequestBody,
      formService.updateFormRequest)
  app.route(BASE_URL + '/create')
    .post(requestMiddleware.gzipCompression(), requestMiddleware.createAndValidateRequestBody,
      formService.createFormRequest)
}
