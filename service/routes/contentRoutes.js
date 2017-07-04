/**
 * file: content-route.js
 * author: Anuj Gupta
 * desc: route file for content
 */

var contentService = require('../service/contentService');
var requestMiddleware = require('../middlewares/request.middleware');

var BASE_URL_V1 = "/api/sb/v1/content";

module.exports = function(app) {

    app.route(BASE_URL_V1 + '/search')
        .post(requestMiddleware.createAndValidateRequestBody, contentService.searchContentAPI);

    app.route(BASE_URL_V1 + '/create')
        .post(requestMiddleware.createAndValidateRequestBody, contentService.createContentAPI);

    app.route(BASE_URL_V1 + '/update/:contentId')
        .patch(requestMiddleware.createAndValidateRequestBody, contentService.updateContentAPI);

    app.route(BASE_URL_V1 + '/upload/:contentId')
        .post(requestMiddleware.createAndValidateRequestBody, contentService.uploadContentAPI);

    app.route(BASE_URL_V1 + '/review/:contentId')
        .post(requestMiddleware.createAndValidateRequestBody, contentService.reviewContentAPI);

    app.route(BASE_URL_V1 + '/publish/:contentId')
        .get(requestMiddleware.createAndValidateRequestBody, contentService.publishContentAPI);

    app.route(BASE_URL_V1 + '/get/:contentId')
        .get(requestMiddleware.createAndValidateRequestBody, contentService.getContentAPI);

    app.route(BASE_URL_V1 + '/get/mycontent/:createdBy')
        .get(requestMiddleware.createAndValidateRequestBody, contentService.getMyContentAPI);
};
