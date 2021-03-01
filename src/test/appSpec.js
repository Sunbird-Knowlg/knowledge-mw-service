var server = require('../app.js')
var expect = require('chai').expect
var request = require('request')
var host = 'http://localhost:5000'
const nock = require('nock');

describe('Check health api', function () {

  before((done) => {
    server.start(done)
  })

  after((done) => {
    server.close(done)
  })

  it('Check with different methods, it should return status code 200', function (done) {
    nock(host).persist().get('/health').reply(200, 'OK');
    request.options({
      url: host + '/health',
      json: true
    }, function (_error, response, body) {
      expect(body).eql('OK')
      done()
    })
  })
})

