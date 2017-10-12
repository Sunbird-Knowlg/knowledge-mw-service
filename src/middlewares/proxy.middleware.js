
var proxy = require('express-http-proxy');
var contentService = require('../service/contentService');
var requestMiddleware = require('../middlewares/request.middleware');
var configUtil = require('sb-config-util');

module.exports = function (app) {

    var ekstep_api = global_ekstep_api_base_url;
    var ekstep_proxy = global_ekstep_proxy_base_url;
    var api_key = global_ekstep_api_key;

    app.use('/api/*', proxy(ekstep_api, {
        proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
            proxyReqOpts.headers['Authorization'] = 'Bearer ' + api_key;
            return proxyReqOpts;
        },
        proxyReqPathResolver: function (req) {
            var originalUrl = req.originalUrl;
            originalUrl = originalUrl.replace('api/', '/');
            return require('url').parse(ekstep_api + originalUrl).path;
        }
    }));

    app.use('/content-plugins/*', proxy(ekstep_proxy, {
        proxyReqPathResolver: function (req) {
            return require('url').parse(ekstep_proxy + req.originalUrl).path;
        }
    }));

    app.use('/plugins/*', proxy(ekstep_proxy, {
        proxyReqPathResolver: function (req) {
            return require('url').parse(ekstep_proxy + req.originalUrl).path;
        }
    }));

    app.use('/assets/public/*', proxy(ekstep_proxy, {
        proxyReqPathResolver: function (req) {
            return require('url').parse(ekstep_proxy + req.originalUrl).path;
        }
    }));

    app.use('/content/preview/*', proxy(ekstep_proxy, {
        proxyReqPathResolver: function (req) {
            return require('url').parse(ekstep_proxy + req.originalUrl).path;
        }
    }));

    app.route('/action' + configUtil.getConfig('EKSTEP_PUBLISH_CONTENT_URI') + '/:contentId')
        .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForReviewerUser, contentService.publishContentAPI);

    app.route('/action' + configUtil.getConfig('EKSTEP_REJECT_CONTENT_URI') + '/:contentId')
        .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForReviewerUser, contentService.rejectContentAPI);

    app.route('/action' + configUtil.getConfig('EKSTEP_ACCEPT_FLAG_CONTENT_URI') + '/:contentId')
        .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForReviewerUser, contentService.acceptFlagContentAPI);

    app.route('/action' + configUtil.getConfig('EKSTEP_REJECT_FLAG_CONTENT_URI') + '/:contentId')
        .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForReviewerUser, contentService.rejectFlagContentAPI);

    app.route('/action' + configUtil.getConfig('EKSTEP_UPDATE_CONTENT_URI') + '/:contentId')
        .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForCreatorUser);

    app.route('/action' + configUtil.getConfig('EKSTEP_REVIEW_CONTENT_URI') + '/:contentId')
        .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForCreatorUser);

    app.route('/action' + configUtil.getConfig('EKSTEP_CONTENT_UPLOAD_URL_URI') + '/:contentId')
        .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.apiAccessForCreatorUser);
        
    app.route('/action' + configUtil.getConfig('EKSTEP_CONTENT_HIERARCHY_UPDATE_URI') + '/')
        .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken, requestMiddleware.hierarchyUpdateApiAccess);


    app.use('/action/*', proxy(ekstep_api, {
        proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
            proxyReqOpts.headers['Authorization'] = 'Bearer ' + api_key;
            return proxyReqOpts;
        },
        proxyReqPathResolver: function (req) {
            var originalUrl = req.originalUrl;
            originalUrl = originalUrl.replace('action/', '/');
            return require('url').parse(ekstep_api + originalUrl).path;
        }
    }));

    app.use('/v1/telemetry', proxy(ekstep_api, {
        proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
            proxyReqOpts.headers['Authorization'] = 'Bearer ' + api_key;
            return proxyReqOpts;
        },
        proxyReqPathResolver: function (req) {
            return require('url').parse(ekstep_api + '/data/v3/telemetry').path;
        }
    }));
};