/**
 * file: DomainRoute.js
 * author: Anuj Gupta
 * desc: route file for user domain and concepts
 */

var domainService = require('../service/conceptService');
var requestMiddleware = require('../middlewares/request.middleware');

var BASE_URL_V1 = "/api/sb/v1";

module.exports = function(app) {

    app.route(BASE_URL_V1 + '/domains')
        .get(requestMiddleware.createAndValidateRequestBody, domainService.getDomainsAPI);

    app.route(BASE_URL_V1 + '/domains/:domainId')
        .get(requestMiddleware.createAndValidateRequestBody, domainService.getDomainByIDAPI);

    app.route(BASE_URL_V1 + '/domains/:domainId/:objectType')
        .get(requestMiddleware.createAndValidateRequestBody, domainService.getObjectTypesAPI);

    app.route(BASE_URL_V1 + '/domains/:domainId/:objectType/:objectId')
        .get(requestMiddleware.createAndValidateRequestBody, domainService.getObjectTypeByIDAPI);

    app.route(BASE_URL_V1 + '/concepts/:conceptId')
        .get(requestMiddleware.createAndValidateRequestBody, domainService.getConceptByIdAPI);

    app.route(BASE_URL_V1 + '/domains/:domainId/:objectType/search')
        .post(requestMiddleware.createAndValidateRequestBody, domainService.searchObjectTypeAPI);

    app.route(BASE_URL_V1 + '/domains/:domainId/:objectType')
        .post(requestMiddleware.createAndValidateRequestBody, domainService.createObjectTypeAPI);

    app.route(BASE_URL_V1 + '/domains/:domainId/:objectType/:objectId')
        .patch(requestMiddleware.createAndValidateRequestBody, domainService.updateObjectTypeAPI);

    app.route(BASE_URL_V1 + '/domains/:domainId/:objectType/:objectId/retire')
        .post(requestMiddleware.createAndValidateRequestBody, domainService.retireObjectTypeAPI);

};
