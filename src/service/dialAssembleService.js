/**
 * @name : dialAssembleService.js
 * @description :: Page assemble service for DIAL scans
 * @author      :: Rayulu Villa
 */

const request = require('request');
const async = require('async');
const _ = require('underscore');
var configUtil = require('sb-config-util');

class PageService {
    constructor(pageConfig) {
        this.pageAssembleConfig = {};
        console.log('this.pageAssembleConfig', this.pageAssembleConfig);
        let instance = this;
        pageConfig.page.forEach(function(page) {
            instance.pageAssembleConfig[page.name] = {
                web: page.portalSections,
                app: page.appSections
            }
        })
    }
    assemble(req, res) {
        const rspObj = req.rspObj;
        const source = req.body.request.source;
        const name = req.body.request.name;
        const filters = req.body.request.filters;
        const sections = this.pageAssembleConfig[name][source];
        let sectionCalls = [];
        let instance = this;
        rspObj.result.sections = [];
        rspObj.result.id = this.pageAssembleConfig[name].id;
        rspObj.result.name = name;
        sections.forEach(function(section) {
            sectionCalls.push(function(callback) {
                var options = instance.getHttpOptions(configUtil.getConfig('SEARCH_SERVICE_BASE_URL') + configUtil.getConfig('SEARCH_URI'), instance.getSearchRequestBody(JSON.parse(section.searchQuery), filters), 'POST', {})
                instance.sendRequest(options, function(error, response, body) {
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
                    instance.sendError(res, { rspObj: rspObj, params: { err: err }});
                } else {
                    instance.sendSuccess(res, { results: results, rspObj: rspObj});
                }
            }
        ); 
    }
    getSearchRequestBody(sectionQuery, filters) {
        if (_.isEmpty(filters))
            return sectionQuery;
        var sectionFilters = sectionQuery.request.filters;
        _.extend(sectionFilters, filters)
        console.log(JSON.stringify(sectionQuery));
        return sectionQuery;
    }
    sendError(res, options) {
        const resObj = options.rspObj;
        resObj.responseCode = options.responseCode || 'SERVER_ERROR';
        resObj.params = options.params || {};
        res.status(500);
        res.json(resObj);
    }
    sendSuccess(res, options) {
        const resObj = options.rspObj;
        resObj.result.sections = options.results;
        res.status(200);
        res.json(resObj);
    }
    sendRequest(options, cb) {
        request(options, function(error, response, body) {
            cb(error, response, body);
        });
    }
    getHttpOptions(url, data, method, headers) {
        var defaultHeaders = {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkMTc1MDIwNDdlODc0ODZjOTM0ZDQ1ODdlYTQ4MmM3MyJ9.7LWocwCn5rrCScFQYOne8_Op2EOo-xTCK5JCFarHKSs'
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
}

const pageConfig = {
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

module.exports = new PageService(pageConfig);