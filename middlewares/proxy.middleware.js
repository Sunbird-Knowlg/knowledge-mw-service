
var proxy = require('express-http-proxy');

module.exports = function (app) {

    var ekstep = "https://qa.ekstep.in";
    var ceUrl = 'https://s3.ap-south-1.amazonaws.com/ekstep-public-qa';

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

    app.use('/v1/telemetry', proxy(ekstep, {
        proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
            proxyReqOpts.headers['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkNjNiMjgwZTQ1NDE0NDU4ODk4NzcwYzZhOGZiZjQ1MCJ9.Ji-22XcRrOiVy4dFAmE68wPxLkNmX4wKbTj_IB7fG6Y';
            return proxyReqOpts;
        },
        proxyReqPathResolver: function (req) {
            return require('url').parse(ekstep + '/api/data/v3/telemetry').path;
        }
    }));
};