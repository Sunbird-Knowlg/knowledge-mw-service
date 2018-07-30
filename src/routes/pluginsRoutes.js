/**
 * file: plugins-route.js
 * author: Harish Kumar G
 * desc: route file for plugin search
 */

var contentService = require('../service/contentService')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL_V1 = '/v1/plugins'

module.exports = function (app) {
  app.route(BASE_URL_V1 + '/search')
    .post(requestMiddleware.createAndValidateRequestBody,
      contentService.searchPluginsAPI)
}
