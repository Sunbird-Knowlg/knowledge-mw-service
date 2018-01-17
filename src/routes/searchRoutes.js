/**
 * file: search-route.js
 * author: Anuj Gupta
 * desc: route file for content
 */

var contentService = require('../service/contentService')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL_V1 = '/v1'

module.exports = function (app) {
  app.route(BASE_URL_V1 + '/search')
    .post(requestMiddleware.createAndValidateRequestBody, contentService.searchAPI)
}
