
var proxy = require('express-http-proxy')
var contentService = require('../service/contentService')
var requestMiddleware = require('../middlewares/request.middleware')
var configUtil = require('sb-config-util')

module.exports = function (app) {
  var contentProviderBaseUrl = configUtil.getConfig('BASE_URL')
  var ekstepProxyUrl = globalEkstepProxyBaseUrl
  var contentProviderApiKey = configUtil.getConfig('Authorization_TOKEN')
  var reqDataLimitOfContentUpload = configUtil.getConfig('CONTENT_UPLOAD_REQ_LIMIT')

  app.use('/api/*', proxy(contentProviderBaseUrl, {
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      proxyReqOpts.headers['Authorization'] = contentProviderApiKey
      return proxyReqOpts
    },
    proxyReqPathResolver: function (req) {
      var originalUrl = req.originalUrl
      originalUrl = originalUrl.replace('api/', '/')
      return require('url').parse(contentProviderBaseUrl + originalUrl).path
    }
  }))

  app.use('/content-plugins/*', proxy(ekstepProxyUrl, {
    proxyReqPathResolver: function (req) {
      return require('url').parse(ekstepProxyUrl + req.originalUrl).path
    }
  }))

  app.use('/plugins/*', proxy(ekstepProxyUrl, {
    proxyReqPathResolver: function (req) {
      return require('url').parse(ekstepProxyUrl + req.originalUrl).path
    }
  }))

  app.use('/assets/public/*', proxy(ekstepProxyUrl, {
    proxyReqPathResolver: function (req) {
      return require('url').parse(ekstepProxyUrl + req.originalUrl).path
    }
  }))

  app.use('/content/preview/*', proxy(ekstepProxyUrl, {
    proxyReqPathResolver: function (req) {
      return require('url').parse(ekstepProxyUrl + req.originalUrl).path
    }
  }))

  app.route('/action' + configUtil.getConfig('PUBLISH_CONTENT_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForReviewerUser, contentService.publishContentAPI)

  app.route('/action' + configUtil.getConfig('REJECT_CONTENT_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForReviewerUser, contentService.rejectContentAPI)

  app.route('/action' + configUtil.getConfig('ACCEPT_FLAG_CONTENT_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForReviewerUser, contentService.acceptFlagContentAPI)

  app.route('/action' + configUtil.getConfig('REJECT_FLAG_CONTENT_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForReviewerUser, contentService.rejectFlagContentAPI)

  app.route('/action' + configUtil.getConfig('UPDATE_CONTENT_URI') + '/:contentId')
    .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForCreatorUser)

  app.route('/action' + configUtil.getConfig('REVIEW_CONTENT_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForCreatorUser)

  app.route('/action' + configUtil.getConfig('CONTENT_UPLOAD_URL_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForCreatorUser)

  app.route('/action' + configUtil.getConfig('CONTENT_HIERARCHY_UPDATE_URI') + '/')
    .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.hierarchyUpdateApiAccess)

  app.route('/action' + configUtil.getConfig('UNLISTED_PUBLISH_CONTENT_URI') + '/:contentId')
    .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.apiAccessForCreatorUser, contentService.unlistedPublishContentAPI)

  app.use('/action/*', proxy(contentProviderBaseUrl, {
    limit: reqDataLimitOfContentUpload,
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      proxyReqOpts.headers['Authorization'] = contentProviderApiKey
      return proxyReqOpts
    },
    proxyReqPathResolver: function (req) {
      var originalUrl = req.originalUrl
      originalUrl = originalUrl.replace('action/', '/')
      return require('url').parse(contentProviderBaseUrl + originalUrl).path
    }
  }))

  app.use('/v1/telemetry', proxy(contentProviderBaseUrl, {
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
      proxyReqOpts.headers['Authorization'] = contentProviderApiKey
      return proxyReqOpts
    },
    proxyReqPathResolver: function (req) {
      return require('url').parse(contentProviderBaseUrl + '/data/v3/telemetry').path
    }
  }))
}
