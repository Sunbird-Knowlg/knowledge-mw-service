/**
 * file: content-route.js
 * author: Anuj Gupta
 * desc: route file for content
 */

var contentService = require('../service/contentService')
var requestMiddleware = require('../middlewares/request.middleware')
var filterMiddleware = require('../middlewares/filter.middleware')
var healthService = require('../service/healthCheckService')

var BASE_URL = '/v1/content'
var dependentServiceHealth = ['EKSTEP']

module.exports = function (app) {
  app.route(BASE_URL + '/search')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, filterMiddleware.addMetaFilters,
      contentService.searchContentAPI)

  app.route(BASE_URL + '/create')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, contentService.createContentAPI)

  app.route(BASE_URL + '/update/:contentId')
    .patch(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForCreatorUser, contentService.updateContentAPI)

  app.route(BASE_URL + '/upload/:contentId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForCreatorUser, contentService.uploadContentAPI)

  app.route(BASE_URL + '/review/:contentId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForCreatorUser, contentService.reviewContentAPI)

  app.route(BASE_URL + '/publish/:contentId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForReviewerUser, contentService.publishContentAPI)

  app.route(BASE_URL + '/retire')
    .delete(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      contentService.retireContentAPI)

  app.route(BASE_URL + '/reject/:contentId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForReviewerUser, contentService.rejectContentAPI)

  app.route(BASE_URL + '/read/:contentId')
    .get(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, contentService.getContentAPI)

  app.route(BASE_URL + '/read/mycontent/:createdBy')
    .get(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, contentService.getMyContentAPI)

  app.route(BASE_URL + '/flag/:contentId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, contentService.flagContentAPI)

  app.route(BASE_URL + '/flag/accept/:contentId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForReviewerUser, contentService.acceptFlagContentAPI)

  app.route(BASE_URL + '/flag/reject/:contentId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForReviewerUser, contentService.rejectFlagContentAPI)

  app.route(BASE_URL + '/upload/url/:contentId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForCreatorUser, contentService.uploadContentUrlAPI)

  app.route(BASE_URL + '/badge/assign/:contentId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, contentService.assignBadgeAPI)

  app.route(BASE_URL + '/badge/revoke/:contentId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, contentService.revokeBadgeAPI)

  app.route(BASE_URL + '/copy/:contentId')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      contentService.copyContentAPI)

  app.route(BASE_URL + '/getContentLockValidation')
    .post(healthService.checkDependantServiceHealth(dependentServiceHealth),
      requestMiddleware.createAndValidateRequestBody, contentService.validateContentLock)
}
