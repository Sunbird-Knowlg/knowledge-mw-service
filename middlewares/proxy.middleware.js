
var proxy = require('express-http-proxy');

module.exports = function (app) {

    var ekstep_api = global_ekstep_api_base_url;
    var ekstep_proxy = global_ekstep_proxy_base_url
    var api_key = global_ekstep_api_key;

    app.use('/api/*', proxy(ekstep_api, {
        proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
            proxyReqOpts.headers['Authorization'] = 'Bearer ' + api_key;
            return proxyReqOpts;
        },
        proxyReqPathResolver: function (req) {
            return require('url').parse(ekstep_api + req.originalUrl).path;
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

    app.use('/action/*', proxy(ekstep_api, {
        proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
            proxyReqOpts.headers['Authorization'] = 'Bearer ' + api_key;
            return proxyReqOpts;
        },
        proxyReqPathResolver: function (req) {
            var originalUrl = req.originalUrl;
            originalUrl = originalUrl.replace('action/', 'api/');
            return require('url').parse(ekstep_api + originalUrl).path;
        }
    }));

    app.use('/v1/telemetry', proxy(ekstep_api, {
        proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
            console.log('telemetry req header: ', srcReq.headers);
            proxyReqOpts.headers['Authorization'] = 'Bearer ' + api_key;
            return proxyReqOpts;
        },
        proxyReqPathResolver: function (req) {
            return require('url').parse(ekstep_api + '/api/data/v3/telemetry').path;
        }
    }));
};