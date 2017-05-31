
var proxy = require('express-http-proxy');

module.exports = function (app) {

    var ekstep = "https://dev.ekstep.in";
    var ceUrl = 'https://s3.ap-south-1.amazonaws.com/ekstep-public-dev';

    app.use('/api/*', proxy(ekstep, {

        proxyReqPathResolver: function (req) {
            return require('url').parse(ekstep + req.originalUrl).path;
        }
    }));

    app.use('/content-plugins/*', proxy(ceUrl, {

        proxyReqPathResolver: function (req) {
            return require('url').parse(ceUrl + req.originalUrl).path;
        }
    }));

    app.use('/plugins/*', proxy(ceUrl, {

        proxyReqPathResolver: function (req) {
            return require('url').parse(ceUrl + req.originalUrl).path;
        }
    }));

    app.use('/assets/public/preview/*', proxy(ceUrl, {

        proxyReqPathResolver: function (req) {
            return require('url').parse(ceUrl + req.originalUrl).path;
        }
    }));
};