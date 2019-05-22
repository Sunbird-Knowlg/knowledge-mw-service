/**
 * @name : dialAssembleService.js
 * @description :: Page assemble service for DIAL scans
 * @author      :: Rayulu Villa
 */

const request = require('request');
const async = require('async');
const _ = require('underscore');
var configUtil = require('sb-config-util');

function assemble(req, res) {
    const rspObj = req.rspObj;
    const source = req.body.request.source;
    const name = req.body.request.name;
    var filters = req.body.request.filters;
    var sections = pageAssembleConfig[name][source];
    let sectionCalls = [];
    rspObj.result.sections = [];
    rspObj.result.id = pageAssembleConfig[name].id;
    rspObj.result.name = name;
    sections.forEach(function(section) {
        sectionCalls.push(function(callback) {
            var options = getHttpOptions(configUtil.getConfig('SEARCH_SERVICE_BASE_URL') + configUtil.getConfig('SEARCH_URI'), getSearchRequestBody(JSON.parse(section.searchQuery), filters), 'POST', {})
            sendRequest(options, function(error, response, body) {
                if(error) {
                    callback(error)
                } else {
                    _.extend(section, response.body.result);
                    section.apiId = response.body.id;
                    section.resmsgid = response.body.params.resmsgid;
                    section.contents = response.body.result.content;
                    section.content = undefined;
                    callback(null, section);
                }
            })
        });
    })
    async.parallel(sectionCalls,
        function(err, results) {
            if(err) {
                sendError(res, { rspObj: rspObj, params: { err: err }});
            } else {
                sendSuccess(res, { results: results, rspObj: rspObj});
            }
        }
    ); 

}

function getSearchRequestBody(sectionQuery, filters) {
    if (_.isEmpty(filters))
        return sectionQuery;
    var sectionFilters = sectionQuery.request.filters;
    _.extend(sectionFilters, filters)
    return sectionQuery;
}

function sendError(res, options) {
    var resObj = options.rspObj;
    resObj.responseCode = options.responseCode || 'SERVER_ERROR';
    resObj.params = options.params || {};
    res.status(500);
    res.json(resObj);
}

function sendSuccess(res, options) {
    var resObj = options.rspObj;
    resObj.result.sections = options.results;
    res.status(200);
    res.json(resObj);
}

function sendRequest(options, cb) {
    request(options, function(error, response, body) {
        cb(error, response, body);
    });
}

function getHttpOptions(url, data, method, headers) {
    var defaultHeaders = {
      'Content-Type': 'application/json'
    }
  
    var http_options = {
      url: url,
      forever: true,
      headers: defaultHeaders,
      method: method,
      json: true
    }
  
    if (headers) {
      headers['Content-Type'] = headers['Content-Type'] ? headers['Content-Type'] : defaultHeaders['Content-Type']
      headers['Authorization'] = defaultHeaders['Authorization']
      http_options.headers = headers
    }
  
    if (data) { http_options.body = data }
    return http_options
}

var pageConfig = {
    "page": [
        {
            "name": "DIAL Code Consumption",
            "portalSections": [],
            "id": "0127029903393832964",
            "appSections": [
                {
                    "display": "{\"name\":{\"en\":\"Linked Content\"}}",
                    "alt": null,
                    "description": null,
                    "index": 1,
                    "sectionDataType": "content",
                    "imgUrl": null,
                    "searchQuery": "{\"request\":{\"facets\":[\"language\",\"grade\",\"domain\",\"contentType\",\"subject\",\"medium\"],\"filters\":{\"contentType\":[\"TextBook\",\"TextBookUnit\"],\"objectType\":[\"Content\"],\"status\":[\"Live\"],\"compatibilityLevel\":{\"max\":4,\"min\":1}},\"mode\":\"collection\"},\"limit\":10,\"sort_by\":{\"lastUpdatedOn\":\"desc\"}}",
                    "name": "Linked Content",
                    "id": "0126541330342952961",
                    "dataSource": null,
                    "status": 1,
                    "group": 1
                }
            ]
        }
    ]
}

var pageAssembleConfig = {};

pageConfig.page.forEach(function(page) {
    pageAssembleConfig[page.name] = {
        web: page.portalSections,
        app: page.appSections
    }
})

module.exports.assemble = assemble