
var proxy = require('express-http-proxy')
var contentService = require('../service/contentService')
var requestMiddleware = require('../middlewares/request.middleware')
var configUtil = require('sb-config-util')

module.exports = function (app) {
  var content_provider_api = global_content_provider_base_url
  var ekstep_proxy = global_ekstep_proxy_base_url
  var api_key = global_content_provider_api_key

  app.use('/api/*', proxy(content_provider_api, {
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      proxyReqOpts.headers['Authorization'] = 'Bearer ' + api_key
      return proxyReqOpts
    },
    proxyReqPathResolver: function (req) {
      var originalUrl = req.originalUrl
      originalUrl = originalUrl.replace('api/', '/')
      return require('url').parse(content_provider_api + originalUrl).path
    }
  }))

  app.use('/content-plugins/*', proxy(ekstep_proxy, {
    proxyReqPathResolver: function (req) {
      return require('url').parse(ekstep_proxy + req.originalUrl).path
    }
  }))

  app.use('/plugins/*', proxy(ekstep_proxy, {
    proxyReqPathResolver: function (req) {
      return require('url').parse(ekstep_proxy + req.originalUrl).path
    }
  }))

  app.use('/assets/public/*', proxy(ekstep_proxy, {
    proxyReqPathResolver: function (req) {
      return require('url').parse(ekstep_proxy + req.originalUrl).path
    }
  }))

  app.use('/content/preview/*', proxy(ekstep_proxy, {
    proxyReqPathResolver: function (req) {
      return require('url').parse(ekstep_proxy + req.originalUrl).path
    }
  }))

  app.route('/action' + configUtil.getConfig('PUBLISH_CONTENT_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForReviewerUser, contentService.publishContentAPI)

  app.route('/action' + configUtil.getConfig('REJECT_CONTENT_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForReviewerUser, contentService.rejectContentAPI)

  app.route('/action' + configUtil.getConfig('ACCEPT_FLAG_CONTENT_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForReviewerUser, contentService.acceptFlagContentAPI)

  app.route('/action' + configUtil.getConfig('REJECT_FLAG_CONTENT_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForReviewerUser, contentService.rejectFlagContentAPI)

  app.route('/action' + configUtil.getConfig('UPDATE_CONTENT_URI') + '/:contentId')
    .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForCreatorUser)

  app.route('/action' + configUtil.getConfig('REVIEW_CONTENT_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForCreatorUser)

  app.route('/action' + configUtil.getConfig('CONTENT_UPLOAD_URL_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForCreatorUser)

  app.route('/action' + configUtil.getConfig('CONTENT_HIERARCHY_UPDATE_URI') + '/')
    .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.hierarchyUpdateApiAccess)

  app.route('/action' + configUtil.getConfig('UNLISTED_PUBLISH_CONTENT_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForCreatorUser, contentService.unlistedPublishContentAPI)

  app.use('/action/*', proxy(content_provider_api, {
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      proxyReqOpts.headers['Authorization'] = 'Bearer ' + api_key
      return proxyReqOpts
    },
    proxyReqPathResolver: function (req) {
      var originalUrl = req.originalUrl
      originalUrl = originalUrl.replace('action/', '/')
      return require('url').parse(content_provider_api + originalUrl).path
    }
  }))

  app.use('/v1/telemetry', proxy(content_provider_api, {
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      proxyReqOpts.headers['Authorization'] = 'Bearer ' + api_key
      return proxyReqOpts
    },
    proxyReqPathResolver: function (req) {
      return require('url').parse(content_provider_api + '/data/v3/telemetry').path
    }
  }))
}
