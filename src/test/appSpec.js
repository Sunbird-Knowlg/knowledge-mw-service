var server = require('../app.js')

var request = require('request')
var host = 'http://localhost:5000'

describe('Check health api', function (done) {
  it('Check with different methods, it should return status code 200', function (done) {
    request.options({
      url: host + '/health',
      json: true
    }, function (error, response, body) {
      expect(body).toBe('OK')
      done()
    })
  })
})

// below method used to close server once all the specs are executed
var _finishCallback = jasmine.Runner.prototype.finishCallback
jasmine.Runner.prototype.finishCallback = function () {
  _finishCallback.bind(this)()
  server.close()
}
