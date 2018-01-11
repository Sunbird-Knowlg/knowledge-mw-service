/**
 * file: dialCodeRoutes.js
 * author: Anuj Gupta
 * desc: route file for dial codes
 */

var dialCodeService = require('../service/dialCodeService.js')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL = '/v1/dialcode'

module.exports = function (app) {
  app.route(BASE_URL + '/generate')
        .post(requestMiddleware.createAndValidateRequestBody, dialCodeService.generateDialCodeAPI)
        // .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, dialCodeService.generateDialCodeAPI);

  app.route(BASE_URL + '/list')
        .post(requestMiddleware.createAndValidateRequestBody, dialCodeService.dialCodeListAPI)
        // .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, dialCodeService.dialCodeListAPI);

  app.route(BASE_URL + '/read')
        // .get(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, dialCodeService.getDialCodeAPI);
        .post(requestMiddleware.createAndValidateRequestBody, dialCodeService.getDialCodeAPI)

  app.route(BASE_URL + '/update/:dialCodeId')
        // .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, dialCodeService.updateDialCodeAPI);
        .patch(requestMiddleware.createAndValidateRequestBody, dialCodeService.updateDialCodeAPI)

  app.route(BASE_URL + '/content/link/:contentId')
        .patch(requestMiddleware.createAndValidateRequestBody, dialCodeService.contentLinkDialCodeAPI)
        // .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, dialCodeService.contentLinkDialCodeAPI);

  app.route(BASE_URL + '/process/status/:processId')
        // .get(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, dialCodeService.getDialCodeAPI);
        .get(requestMiddleware.createAndValidateRequestBody, dialCodeService.getProcessIdStatusAPI)
}
