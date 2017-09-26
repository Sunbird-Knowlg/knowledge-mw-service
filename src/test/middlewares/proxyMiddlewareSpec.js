/** 
 * @name : proxyMIddlewareSpec.js 
 * @description :: Responsible for test proxy.middleware.js 
 * @author      :: Anuj Gupta 
 */ 
 
 var request = require('request'); 
var host = "http://localhost:5000"; 
 
describe("Check elstep api for content player", function() { 
 
  it("Should check api/* route", function(done) { 
    request.get({ 
                headers: {'Content-Type': 'application/json'}, 
                uri: host + '/api/content', 
                json: true 
            }, function (error, response, body) { 
                done(); 
            }); 
  }); 
 
  it("Should check content-plugins/* route", function(done) { 
    request.get({ 
                headers: {'Content-Type': 'application/json'}, 
                uri: host + '/content-plugins/content', 
                json: true 
            }, function (error, response, body) { 
              expect(response.statusCode).toBe(403); 
                done(); 
            }); 
  }); 
 
  it("Should check plugins/* route", function(done) { 
    request.get({ 
                headers: {'Content-Type': 'application/json'}, 
                uri: host + '/plugins/content', 
                json: true 
            }, function (error, response, body) { 
              expect(response.statusCode).toBe(403); 
                done(); 
            }); 
  }); 
 
  it("Should check /assets/public/* route", function(done) { 
    request.get({ 
                headers: {'Content-Type': 'application/json'}, 
                uri: host + '/assets/public/content', 
                json: true 
            }, function (error, response, body) { 
              expect(response.statusCode).toBe(403); 
                done(); 
            }); 
  }); 
 
  it("Should check /content/preview/* route", function(done) { 
    request.get({ 
                headers: {'Content-Type': 'application/json'}, 
                uri: host + '/content/preview/content', 
                json: true 
            }, function (error, response, body) { 
              expect(response.statusCode).toBe(403); 
                done(); 
            }); 
  }); 
 
  it("Should check /action/* route", function(done) { 
    request.get({ 
                headers: {'Content-Type': 'application/json'}, 
                uri: host + '/action/content', 
                json: true 
            }, function (error, response, body) { 
              expect(response.statusCode).toBe(404); 
                done(); 
            }); 
  }); 
 
  it("Should check v1/telemetry route", function(done) { 
    request.get({ 
                headers: {'Content-Type': 'application/json'}, 
                uri: host + '/v1/telemetry', 
                json: true 
            }, function (error, response, body) { 
              expect(response.statusCode).toBe(404); 
                done(); 
            }); 
  }); 
});