/**
 * file: DomainRoute.js
 * author: Anuj Gupta
 * desc: route file for user domain and concepts
 */

var domainService = require('../service/conceptService')
var requestMiddleware = require('../middlewares/request.middleware')
var filterMiddleware = require('../middlewares/filter.middleware')

var BASE_URL_V1 = '/v1'

module.exports = function (app) {
  app.route(BASE_URL_V1 + '/domains')
    .get(requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, domainService.getDomainsAPI)

  app.route(BASE_URL_V1 + '/domains/:domainId')
    .get(requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, domainService.getDomainByIDAPI)

  app.route(BASE_URL_V1 + '/domains/:domainId/:objectType')
    .get(requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, domainService.getObjectTypesAPI)

  app.route(BASE_URL_V1 + '/domains/:domainId/:objectType/:objectId')
    .get(requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, domainService.getObjectTypeByIDAPI)

  app.route(BASE_URL_V1 + '/concepts/:conceptId')
    .get(requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, domainService.getConceptByIdAPI)

  app.route(BASE_URL_V1 + '/domains/:domainId/:objectType/search')
    .post(requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, filterMiddleware.addMetaFilters,
      domainService.searchObjectTypeAPI)

  app.route(BASE_URL_V1 + '/domains/:domainId/:objectType')
    .post(requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, domainService.createObjectTypeAPI)

  app.route(BASE_URL_V1 + '/domains/:domainId/:objectType/:objectId')
    .patch(requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, domainService.updateObjectTypeAPI)

  app.route(BASE_URL_V1 + '/domains/:domainId/:objectType/:objectId/retire')
    .post(requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, domainService.retireObjectTypeAPI)

  app.route(BASE_URL_V1 + '/terms/list')
    .get(requestMiddleware.gzipCompression(),
      requestMiddleware.createAndValidateRequestBody, domainService.listTermsAPI)

  app.route(BASE_URL_V1 + '/resourcebundles/list')
    .get(requestMiddleware.createAndValidateRequestBody, domainService.listResourceBundlesAPI)

  app.route(BASE_URL_V1 + '/ordinals/list')
    .get(requestMiddleware.createAndValidateRequestBody, domainService.listOrdinalsAPI)
}
