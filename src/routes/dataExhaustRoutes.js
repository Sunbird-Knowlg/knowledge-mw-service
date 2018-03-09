
/**
 * file: dataExhaustRoutes.js
 * author: Anuj Gupta
 * desc: route file for data exhaust service
 */

var dataExaustService = require('../service/dataExhaustService')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL = '/v1/dataset/request'

module.exports = function (app) {
  app.route(BASE_URL + '/submit')
    .post(requestMiddleware.createAndValidateRequestBody, dataExaustService.submitDataSetRequest)

  app.route(BASE_URL + '/list/:clientKey')
    .get(requestMiddleware.createAndValidateRequestBody, dataExaustService.getListOfDataSetRequest)

  app.route(BASE_URL + '/read/:clientKey/:requestId')
    .get(requestMiddleware.createAndValidateRequestBody, dataExaustService.getDataSetDetailRequest)

  app.route(BASE_URL + '/:dataSetId/:channelId')
    .get(requestMiddleware.createAndValidateRequestBody, dataExaustService.getChannelDataSetRequest)
}
