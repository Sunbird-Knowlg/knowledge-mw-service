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
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.generateDialCodeAPI)

  app.route(BASE_URL + '/list')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.dialCodeListAPI)

  app.route(BASE_URL + '/read')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.getDialCodeAPI)

  app.route(BASE_URL + '/update/:dialCodeId')
    .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.updateDialCodeAPI)

  app.route(BASE_URL + '/content/link')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.contentLinkDialCodeAPI)

  app.route(BASE_URL + '/search')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.searchDialCodeAPI)

  app.route(BASE_URL + '/publish/:dialCodeId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.publishDialCodeAPI)

  app.route(BASE_URL + '/publisher/create')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.createPublisherAPI)

  app.route(BASE_URL + '/publisher/read/:publisherId')
    .get(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.getPublisherAPI)

  app.route(BASE_URL + '/publisher/update/:publisherId')
    .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.updatePublisherAPI)

  app.route(BASE_URL + '/process/status/:processId')
    .get(requestMiddleware.createAndValidateRequestBody, dialCodeService.getProcessIdStatusAPI)
}
