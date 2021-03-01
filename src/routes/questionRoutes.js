/**
 * file: questionRoutes.js
 * author: Harish Kumar Gangula
 * desc: route file for questions
 */

var questionService = require('../service/questionService')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL_V1 = '/v1/question'

module.exports = function (app) {
  app.route(BASE_URL_V1 + '/list')
    .post(requestMiddleware.createAndValidateRequestBody,
      questionService.getList)
}
