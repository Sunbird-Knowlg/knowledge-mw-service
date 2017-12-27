var request = require('request');
var host = "http://localhost:5000";
var base_url = host + "/v1/dialcode";
var dialCodeId = 'do_2123277638089523201167';
var contentId = 'do_2123277638089523201167';
var channel = 'sunbird'
var publisher = 'Anuj'

describe("Dialcode", function () {

    describe("generate dialcode", function () {
        var generateDialCodeReq = {
            "request": {
                    "dialcodes" : {
                    "count": 123,
                    "channel": channel,
                    "publisher": publisher
                }
            }
        }
        it('should failed due to invalid request path', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/generate1',
                body: generateDialCodeReq,
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(404);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });
        it('should failed due to invalid request object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/generate',
                body: {
                    "request1": generateDialCodeReq.request
                },
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });
        it('should failed due to invalid dialcode object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/generate',
                body: {
                    "request": {
                        "dialcode": {

                        }
                    }
                },
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });
        it('should success', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/generate',
                body: generateDialCodeReq,
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                expect(body.result.downloadUrl).toBeDefined();
                expect(body.result.count).toBeDefined();
                done();
            });
        });
    });

    describe("get dialcode", function () {

        it('should failed due to invalid request url', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/read1/' + dialCodeId,
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(404);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should failed due to invalid dialcode id', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/read' + dialCodeId + '12',
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(404);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should success', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/read' + dialCodeId,
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(404);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                expect(body.result.dialcode).toBeDefined();
                if(body.result.dialcode) {
                    expect(body.result.dialcode.identifier).toBe(dialCodeId);
                }
                done();
            });
        });
    });

    describe("update dialcode", function () {
        it('should failed due to invalid request url', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/update1/' + dialCodeId,
                body: {
                    "request": {
                        "dialcode": {

                        }
                    }
                },
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(404);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should failed due to missing request object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/update/' + dialCodeId,
                body: {
                    }
                },
                json: true
            }, function (error, response, body) {
                console.log(body);
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should failed due to invalid request object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/update/' + dialCodeId,
                body: {
                    "request": {
                        "dialcode": {

                        }
                    }
                },
                json: true
            }, function (error, response, body) {
                console.log(body);
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should failed due to invalid dialcode id', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/update/' + dialCodeId + '12',
                body: {
                    "request": {
                        "dialcode": {

                        }
                    }
                },
                json: true
            }, function (error, response, body) {
                console.log(body);
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should success', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/update/' + dialCodeId,
                body: {
                    "dialcode": {
                        "channel": channel,
                        "publisher": 'Amit',
                        "metadata": {}
                    }
                },
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                expect(body.result.identifier).toBeDefined();
                done();
            });
        });
    });
    describe("list service", function () {
        var generateDialCodeReq = {
            "request": {
                "count": 123,
                "channel": channel,
                "publisher": publisher
            }
        }

        it('should failed due to invalid request path', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/list1',
                body: generateDialCodeReq,
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(404);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });
        
        it('should failed due to missing request object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/list',
                body: {
                    }
                },
                json: true
            }, function (error, response, body) {
                console.log(body);
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should failed due to missing required fields', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/list',
                body: {
                    "request": {
                        
                    }
                },
                json: true
            }, function (error, response, body) {
                console.log(body);
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });
        it('Success', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/list',
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                expect(body.result.dialcodes).toBeDefined();
                done();
            });
        });
    });

    describe("link content", function () {
        it('should failed due to invalid request url', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/content/link1/' + contentId,
                body: {
                    "request": {
                        "dialcodes": {

                        }
                    }
                },
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(404);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should failed due to missing request object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/content/link/' + contentId,
                body: {
                    }
                },
                json: true
            }, function (error, response, body) {
                console.log(body);
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should failed due to invalid request object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/content/link/' + contentId,
                body: {
                    "request": {
                        "dialcode": []                    }
                },
                json: true
            }, function (error, response, body) {
                console.log(body);
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should failed due to invalid content id', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/content/link/' + contentId + '12',
                body: {
                    "request": {
                        "dialcode": {
                            "code": dialCodeId,
                        }
                    }
                },
                json: true
            }, function (error, response, body) {
                console.log(body);
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should success', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/content/link/' + contentId,
                body: {
                    "request": {
                        "dialcode": {
                            "code": dialCodeId,
                        }
                    }
                },
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                expect(body.result.status).toBe("successful");
                done();
            });
        });
    });
    
});