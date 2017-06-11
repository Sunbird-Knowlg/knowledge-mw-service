/**
 * file: utilsRoute.js
 * author: Anuj Gupta
 * desc: route file for utils
 */

var contentService = require('../service/utilsService');
var requestMiddleware = require('../middlewares/request.middleware');

var BASE_URL_V1 = "/api/sb/v1";

module.exports = function(app) {

    app.route(BASE_URL_V1 + '/upload/media')
        .post(requestMiddleware.createAndValidateRequestBody, contentService.uploadMediaAPI);

};
