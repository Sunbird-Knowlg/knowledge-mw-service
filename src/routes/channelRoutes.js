/**
 * file: channel-route.js
 * author: Rajath V B
 * desc: route file for Channel
 */

var channelService = require('../service/channelService')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL_V1_channel = '/v1/channel'

module.exports = function (app) {
  app.route(BASE_URL_V1_channel + '/read/:channelId')
    .get(requestMiddleware.createAndValidateRequestBody, channelService.getChannelValuesById)

  app.route(BASE_URL_V1_channel + '/list')
    .post(requestMiddleware.createAndValidateRequestBody, channelService.ChannelList)

  app.route(BASE_URL_V1_channel + '/search')
    .post(requestMiddleware.createAndValidateRequestBody, channelService.ChannelSearch)

  app.route(BASE_URL_V1_channel + '/create')
    .post(requestMiddleware.createAndValidateRequestBody, channelService.ChannelCreate)

  app.route(BASE_URL_V1_channel + '/update/:channelId')
    .patch(requestMiddleware.createAndValidateRequestBody, channelService.ChannelUpdate)
}
