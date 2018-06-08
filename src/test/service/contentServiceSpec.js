var request = require('request')
var requestMiddleware = require('../../middlewares/request.middleware')
var httpMocks = require('node-mocks-http')

var host = 'http://localhost:5000'
var baseUrl = host + '/v1/content'

// This function used to create content and
function createContent () {
  request.post({
    headers: {'Content-Type': 'application/json'},
    uri: baseUrl + '/create',
    body: {
      'request': {
        'content': {
          'name': 'Content Name',
          'description': 'Content Description',
          'mimeType': 'application/pdf',
          'contentType': 'Story'
        }
      }
    },
    json: true
  }, function (_error, _response, body) {
    return body.result.content_id
  })
}

function getContentByStatus (status, callback) {
  request.post({
    headers: {'Content-Type': 'application/json'},
    uri: baseUrl + '/search',
    body: {
      'request': {
        'filters': {
          status: status
        }
      }
    },
    json: true
  }, function (error, _response, body) {
    return callback(error, body.result.content[0])
  })
}

describe('Composite search services', function () {
  var req, res
  var body = {
    'request': {
      'query': 'Test',
      'filters': {}
    }
  }
  it('Failed due to empty body', function (done) {
    request.post({
      headers: {'Content-Type': 'application/json'},
      uri: baseUrl + '/search',
      json: true
    }, function (_error, response, body) {
      expect(response.statusCode).toBe(400)
      expect(body).toBeDefined()
      expect(body.responseCode).toBe('CLIENT_ERROR')
      expect(body.result).toBeDefined()
      done()
    })
  })

  it('should search the contents', function (done) {
    request.post({
      headers: {'Content-Type': 'application/json'},
      uri: baseUrl + '/search',
      body: {
        'request': {
          'query': 'Test',
          'filters': {}
        }
      },
      json: true
    }, function (_error, response, body) {
      expect(response.statusCode).toBe(200)
      expect(body).toBeDefined()
      expect(body.responseCode).toBe('OK')
      expect(body.result).toBeDefined()
      expect(body.result.content).toBeDefined()
      done()
    })
  })
  beforeEach(function (done) {
    req = httpMocks.createRequest({
      method: 'POST',
      uri: baseUrl + '/search',
      body: body
    })

    res = httpMocks.createResponse()

    done() // call done so that the next test can run
  })
  it('check for filter in config with whitelist', function (done) {
    var whiteListQuery = (process.env.sunbird_content_service_whitelisted_channels).split(',')
    requestMiddleware.addChannelFilters(req, res, function next () {
      expect(req.body.request.filters.channel).toEqual(whiteListQuery)
    })
    done()
  })
  it('check for filter in config with blacklist', function (done) {
    var blackListQuery = {'ne': ((process.env.sunbird_content_service_blacklisted_channels).split(','))}
    var whiteListQuery = (process.env.sunbird_content_service_whitelisted_channels).split(',')
    requestMiddleware.addChannelFilters(req, res, function next () {
      if (!whiteListQuery && blackListQuery) {
        expect(req.body.request.filters.channel).toEqual(blackListQuery)
      }
    })
    done()
  })
})

describe('Composite search services with request filter channel search', function () {
  var req, res
  var body = {
    'request': {
      'query': 'Test',
      'filters': {
        'channel': 'in.ekstep'
      }
    }
  }
  beforeEach(function (done) {
    req = httpMocks.createRequest({
      method: 'POST',
      uri: baseUrl + '/search',
      body: body
    })

    res = httpMocks.createResponse()

    done() // call done so that the next test can run
  })
  it('check for filter in request', function (done) {
    requestMiddleware.addChannelFilters(req, res, function next () {
      expect(req.body.request.filters.channel).toEqual('in.ekstep')
    })
    done()
  })
})

describe('Content', function () {
  describe('search services', function () {
    it('should search content failed due to invalid request object', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/search',
        body: {
          'request1': {
            'filters': {}
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed search content due to missing filter object', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/search',
        body: {
          'request': {
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed search content due to invalid filter object', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/search',
        body: {
          'request': {
            'filter1': {}
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('should search the contents', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/search',
        body: {
          'request': {
            'query': 'Test',
            'filters': {}
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        expect(body.result.content).toBeDefined()
        done()
      })
    })
  })

  describe('create service', function () {
    it('Failed due to missing request object in body', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/create',
        body: {

        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to missing or invalid request object', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/create',
        body: {
          'request1': {
            'content': {
              'name': 'Content Name',
              'description': 'Content Description'
            }
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to missing or invalid content object', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/create',
        body: {
          'request': {
            'content1': {
              'name': 'Content Name',
              'description': 'Content Description'
            }
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to missing required field name', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/create',
        body: {
          'request': {
            'content': {
              'description': 'Content Description'
            }
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to missing required field description', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/create',
        body: {
          'request': {
            'content': {
              'name': 'Content Name'
            }
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to missing required field mimeType', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/create',
        body: {
          'request': {
            'content': {
              'name': 'Content Name',
              'description': 'Content Description',
              'contentType': 'Collection'
            }
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to missing required field contentType', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/create',
        body: {
          'request': {
            'content': {
              'name': 'Content Name',
              'description': 'Content Description',
              'mimeType': 'application/pdf'
            }
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('should create content success', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/create',
        body: {
          'request': {
            'content': {
              'name': 'Content Name',
              'description': 'Content Description',
              'mimeType': 'application/pdf',
              'contentType': 'Story',
              'createdBy': 'Test'
            }
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        done()
      })
    })
  })

  describe('update service', function () {
    var contentId = 'do_212327128776556544182'
    it('Failed due to missing or invalid request object', function (done) {
      request.patch({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/update/' + contentId,
        body: {
          'request1': {
            'content': {
              'name': 'Content Name Update',
              'description': 'Content Description update'
            }
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to missing or invalid content object', function (done) {
      request.patch({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/update/' + contentId,
        body: {
          'request': {
            'content1': {
              'name': 'Content Name Update',
              'description': 'Content Description update'
            }
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to missing required field versionKey', function (done) {
      request.patch({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/update/' + contentId,
        body: {
          'request': {
            'content': {
              'name': 'Content Name'
            }
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Update content success', function (done) {
      request.patch({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/update/' + contentId,
        body: {
          'request': {
            'content': {
              'name': 'Content Name Update',
              'versionKey': '12123123212'
            }
          }
        },
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        done()
      })
    })
  })

  describe('get service', function () {
    var contentId = 'do_212327128776556544182'

    it('Failed due to missing or invalid content ID', function (done) {
      request.get({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/read/' + contentId + 'dssdf',
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(404)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('RESOURCE_NOT_FOUND')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Success', function (done) {
      request.get({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/read/' + contentId,
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        expect(body.result.content).toBeDefined()
        done()
      })
    })
  })

  describe('review service', function () {
    var contentId = 'do_212327063701544960179'

    it('Failed due to missing or invalid content ID', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/review/' + contentId + 'dssdf',
        body: {},
        json: true
      }, function (_error, response, _body) {
        expect(response.statusCode).toBe(400)
        done()
      })
    })

    it('Success', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/review/' + contentId,
        body: {},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        done()
      })
    })
  })

  describe('publish service', function () {
    var contentId = 'do_212327063701544960179'
    it('Failed due to missing or invalid request object', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/publish/' + contentId,
        body: {request: {}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to missing or invalid content ID', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/publish/' + contentId + 'dssdf',
        body: {request: {lastPublishedBy: '349'}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    xit('Success', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/publish/' + contentId,
        body: {request: {content: {lastPublishedBy: '349'}}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        done()
      })
    })
  })

  describe('get myContent service', function () {
    var userId = 'e886f4a8-890e-4e73-adc2-5afebad93c08'

    it('Count 0 due to invalid user Id', function (done) {
      request.get({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/read/mycontent/' + userId + 'fsdfdsff',
        body: {},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Success', function (done) {
      request.get({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/read/mycontent/' + userId,
        body: {},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        expect(body.result.content).toBeDefined()
        done()
      })
    })
  })

  describe('retire service', function () {
    var contentIds = ['do_212327128776556544182ff']

    it('Failed due to missing or invalid request object', function (done) {
      request.delete({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/retire',
        body: {request: {}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })
    contentIds = ['do_212327063701544960179']
    it('Failed due to missing or invalid contentIds key', function (done) {
      request.delete({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/retire',
        body: {request: {contentId: contentIds}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Success', function (done) {
      request.delete({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/retire',
        body: {request: {contentIds: contentIds}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        done()
      })
    })
  })

  describe('reject service', function () {
    var contentId = 'do_212326355637837824131'

    it('Failed due to missing or invalid contentId', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/reject/' + contentId + 'ff',
        body: {request: {}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(404)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('RESOURCE_NOT_FOUND')
        expect(body.result).toBeDefined()
        done()
      })
    })

    xit('Success', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/reject/' + createContent(),
        body: {request: {}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        done()
      })
    })
  })

  describe('create flag service', function () {
    var contentId = 'do_20043627'

    it('Failed due to missing or invalid request object', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/flag/' + contentId + 'ff',
        body: {request1: {}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to missing required fields', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/flag/' + contentId,
        body: {request: { flaggedReasons: ['Copyright Violation'], flaggedBy: 'Test case', flags: ['Test case'] }},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to invalid contentId', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/flag/' + contentId + 'ff',
        body: {request: { flaggedReasons: ['Copyright Violation'],
          flaggedBy: 'Test case',
          flags: ['Test case'],
          versionKey: '31312314' }},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(404)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('RESOURCE_NOT_FOUND')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Success', function (done) {
      getContentByStatus('Live', function (_err, content) {
        request.post({
          headers: {'Content-Type': 'application/json'},
          uri: baseUrl + '/flag/' + content.identifier,
          body: {request: { flagReasons: ['Copyright Violation'],
            flaggedBy: 'Test case',
            flags: ['Test case'],
            versionKey: content.versionKey }},
          json: true
        }, function (_error, response, body) {
          expect(response.statusCode).toBe(200)
          expect(body).toBeDefined()
          expect(body.responseCode).toBe('OK')
          expect(body.result).toBeDefined()
          done()
        })
      })
    })
  })

  describe('accept flag service', function () {
    var contentId = 'do_20043627'

    it('Failed due to invalid request object', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/flag/accept/' + contentId,
        body: {request: {}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to invalid contentId', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/flag/accept/' + contentId + '123',
        body: {request: {versionKey: '23434234234'}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(404)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('RESOURCE_NOT_FOUND')
        expect(body.result).toBeDefined()
        done()
      })
    })

    xit('Success', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/flag/accept/' + contentId,
        body: {request: {versionKey: '1504844754263'}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        done()
      })
    })
  })

  describe('reject flag service', function () {
    var contentId = 'do_20043627'

    it('Failed due to invalid or missing request object', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/flag/reject/' + contentId,
        body: {request1: {}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to invalid contentId', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/flag/reject/' + contentId + '123',
        body: {request: {versionKey: '23434234234'}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(404)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('RESOURCE_NOT_FOUND')
        expect(body.result).toBeDefined()
        done()
      })
    })

    xit('Success', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/flag/reject/' + contentId,
        body: {request: {versionKey: '1504844754263'}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        done()
      })
    })
  })

  describe('get pre-signed url Service', function () {
    var contentId = 'do_20043627'

    it('Failed due to invalid or missing request object', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/upload/url/' + contentId,
        body: {request1: {content: {}}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to invalid or missing content object', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/upload/url/' + contentId,
        body: {request: {content1: {}}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Failed due to missing required fields', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/upload/url/' + contentId,
        body: {request: {content: {fileName1: 'test.pdf'}}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(400)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('CLIENT_ERROR')
        expect(body.result).toBeDefined()
        done()
      })
    })

    it('Success', function (done) {
      request.post({
        headers: {'Content-Type': 'application/json'},
        uri: baseUrl + '/upload/url/' + contentId,
        body: {request: {content: {fileName: 'test.pdf'}}},
        json: true
      }, function (_error, response, body) {
        expect(response.statusCode).toBe(200)
        expect(body).toBeDefined()
        expect(body.responseCode).toBe('OK')
        expect(body.result).toBeDefined()
        done()
      })
    })
  })
})
