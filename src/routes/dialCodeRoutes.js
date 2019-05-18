/**
 * file: dialCodeRoutes.js
 * author: Anuj Gupta
 * desc: route file for dial codes
 */

var dialCodeService = require('../service/dialCodeService.js')
var requestMiddleware = require('../middlewares/request.middleware')
var healthService = require('../service/healthCheckService')

var BASE_URL = '/v1/dialcode'
var dependentServiceHealth = ['EKSTEP', 'CASSANDRA']

module.exports = function (app) {
  app.route(BASE_URL + '/generate')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.generateDialCodeAPI)

  app.route(BASE_URL + '/list')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.dialCodeListAPI)

  app.route(BASE_URL + '/read')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.getDialCodeAPI)

  app.route(BASE_URL + '/update/:dialCodeId')
    .patch(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.updateDialCodeAPI)

  app.route(BASE_URL + '/content/link')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.contentLinkDialCodeAPI)

  app.route(BASE_URL + '/search')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.searchDialCodeAPI)

  app.route(BASE_URL + '/publish/:dialCodeId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.publishDialCodeAPI)

  app.route(BASE_URL + '/publisher/create')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.createPublisherAPI)

  app.route(BASE_URL + '/publisher/read/:publisherId')
    .get(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.getPublisherAPI)

  app.route(BASE_URL + '/publisher/update/:publisherId')
    .patch(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkChannelID,
      dialCodeService.updatePublisherAPI)

  app.route(BASE_URL + '/process/status/:processId')
    .get(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, dialCodeService.getProcessIdStatusAPI)

  app.route(BASE_URL + '/reserve/:contentId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      dialCodeService.reserveDialCode)

  app.route(BASE_URL + '/release/:contentId')
    .patch(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      dialCodeService.releaseDialCode)
}
