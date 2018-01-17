var request = require('request');
var host = "http://localhost:5000";
var base_url = host + "/v1/dialcode";
var dialCodeId = 'JAG546';
var contentId = 'do_2123277638089523201167';
var channel = 'sunbird'
var publisher = 'Anuj'

describe("Dialcode", function () {

    describe("generate dialcode", function () {
        var generateDialCodeReq = {
            "request": {
                    "dialcodes" : {
                    "count": 1,
                    "channel": channel,
                    "publisher": publisher
                }
            }
        }
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
                headers: {'Content-Type': 'application/json', 'X-Channel-id': 'sunbird'},
                uri: base_url + '/generate',
                body: generateDialCodeReq,
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                expect(body.result.dialcodes).toBeDefined();
                expect(body.result.count).toBeDefined();
                dialCodeId = body.result.dialcodes[0];
                done();
            });
        });
    });

    describe("get dialcode", function () {

        it('should failed due to invalid dialcode id', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/read/' + dialCodeId + '12',
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(404);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("RESOURCE_NOT_FOUND");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should success', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/read/' + dialCodeId,
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                // expect(body.result.dialcode).toBeDefined();
                if(body.result.dialcode) {
                    expect(body.result.dialcode.identifier).toBe(dialCodeId);
                }
                done();
            });
        });
    });

    describe("update dialcode", function () {

        it('should failed due to missing request object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json', 'X-Channel-id': 'sunbird'},
                uri: base_url + '/update/' + dialCodeId,
                body: {},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should failed due to invalid request object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json', 'X-Channel-id': 'sunbird'},
                uri: base_url + '/update/' + dialCodeId,
                body: {
                    "request": {
                        "dialcode1": {

                        }
                    }
                },
                json: true
            }, function (error, response, body) {
                console.log("sasdfsd", body)
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should failed due to invalid dialcode id', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json', 'X-Channel-id': 'sunbird'},
                uri: base_url + '/update/' + dialCodeId + '12',
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
                expect(body.responseCode).toBe("RESOURCE_NOT_FOUND");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('should success', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json', 'X-Channel-id': 'sunbird'},
                uri: base_url + '/update/' + dialCodeId,
                body: {
                    "request": {
                        "dialcode": {
                            "metadata": {
                            "class":"std2",
                            "subject":"Math",
                            "board":"AP CBSE"
                            }
                        }
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
                "count": 1,
                "channel": channel,
                "publisher": publisher
            }
        }
        
        it('should failed due to missing request object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/list',
                body: {
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

        it('should failed due to missing required fields', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/list',
                body: {
                    "request": {
                        
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
        it('Success', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'X-Channel-id': 'sunbird'},
                uri: base_url + '/list',
                body: {
                    "request": {
                        "search": {
                            "status":"Draft"
                        }
                    }
                },
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

    xdescribe("link content", function () {
        it('should failed due to missing request object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/content/link/' + contentId,
                body: {
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
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("RESOURCE_NOT_FOUND");
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