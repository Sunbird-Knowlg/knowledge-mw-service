var request = require('request');

var host = "http://localhost:5000";
var base_url = host + "/v1/content";

describe("Content", function () {

    xdescribe("Search Services", function () {

        it('should search content failed due to missing cid in headers', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/search',
                body: {
                    "request1": {
                        "filters": {}
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

        it('Failedailed search content due to invalid request object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/search',
                body: {
                    "request1": {
                        "filters": {}
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

        it('Failedailed search content due to invalid request filter object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/search',
                body: {
                    "request": {
                        "filter": {}
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


        it('should search the contents', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/search',
                body: {
                    "request": {
                        "query": "Test",
                        "filters": {}
                    }
                },
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                expect(body.result.content).toBeDefined();
                done();
            });
        });
    });

    xdescribe("Create Service", function () {

        it('Failed due to missing cid in headers', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/create',
                body: {
                    "request": {
                        "content": {
                            "name": "Content Name",
                            "description": "Content Description"
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

        it('Failed due to missing request object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/create',
                body: {
                    "request1": {
                        "content": {
                            "name": "Content Name",
                            "description": "Content Description"
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

        it('Failed due to missing content object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/create',
                body: {
                    "request": {
                        "content1": {
                            "name": "Content Name",
                            "description": "Content Description"
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

        it('Failed due to missing required field name', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/create',
                body: {
                    "request": {
                        "content": {
                            "description": "Content Description"
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

        it('Failed due to missing required field description', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/create',
                body: {
                    "request": {
                        "content": {
                            "name": "Content Name"
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

        it('Failed due to missing required field mimeType', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/create',
                body: {
                    "request": {
                        "content": {
                            "name": "Content Name",
                            "description": "Content Description",
                            "contentType": "Collection"
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

        it('Failed due to missing required field contentType', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/create',
                body: {
                    "request": {
                        "content": {
                            "name": "Content Name",
                            "description": "Content Description",
                            "mimeType": "image/jpg"
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

        xit('should create content success', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/create',
                body: {
                    "request": {
                        "content": {
                            "name": "Content Name",
                            "description": "Content Description",
                            "mimeType": "image/jpg",
                            "contentType": "Collection"
                        }
                    }
                },
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                done();
            });
        });

    });

    xdescribe("Update Service", function () {
        var contentId = "do_1122649778690785281104";
        it('Failed due to missing cid in headers', function (done) {

            request.patch({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/update/' + contentId,
                body: {
                    "request": {
                        "content": {
                            "name": "Content Name Update",
                            "description": "Content Description update"
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

        it('Failed due to missing request object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/update/' + contentId,
                body: {
                    "request1": {
                        "content": {
                            "name": "Content Name Update",
                            "description": "Content Description update"
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

        it('Failed due to missing content object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/update/' + contentId,
                body: {
                    "request": {
                        "content1": {
                            "name": "Content Name Update",
                            "description": "Content Description update"
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

        it('Failed due to missing required field versionKey', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/update/' + contentId,
                body: {
                    "request": {
                        "content": {
                            "name": "Content Name"
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

        xit('Update content success', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/update/' + contentId,
                body: {
                    "request": {
                        "content": {
                            "name": "Content Name Update",
                            "versionKey": "12123123212"
                        }
                    }
                },
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                done();
            });
        });
    });

    xdescribe("Get Service", function () {
        var contentId = "do_1122649778690785281104";
        it('Failed due to missing cid in headers', function (done) {

            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/read/' + contentId,
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(404);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("RESOURCE_NOT_FOUND");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('Failed due to missing or invalid content ID', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/read/' + contentId + 'dssdf',
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(404);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("RESOURCE_NOT_FOUND");
                expect(body.result).toBeDefined();
                done();
            });
        });

        xit('Success', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/read/' + contentId,
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                expect(body.result.content).toBeDefined();
                done();
            });
        });
    });

    describe("Review Service", function () {
        var contentId = "do_1122649778690785281104";
        it('Failed due to missing cid in headers', function (done) {

            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/review/' + contentId,
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

        it('Failed due to missing or invalid content ID', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/review/' + contentId + 'dssdf',
                body: {},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(400);
                done();
            });
        });

        xit('Success', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/review/' + contentId,
                body: {},
                json: true
            }, function (error, response, body) {
                console.log(body)
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                done();
            });
        });
    });

    xdescribe("Publish Service", function () {
        var contentId = "do_1122649778690785281104";
        it('Failed due to missing cid in headers', function (done) {

            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/publish/' + contentId,
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

        it('Failed due to missing or invalid content ID', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/publish/' + contentId + 'dssdf',
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

        xit('Success', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/publish/' + contentId,
                body: {},
                json: true
            }, function (error, response, body) {
                console.log(body);
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                done();
            });
        });
    });

    xdescribe("Get MyContent Service", function () {
        var userId = "263";
        it('Failed due to missing cid in headers', function (done) {

            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/get/mycontent/' + userId,
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

        it('Failed due to missing or invalid content ID', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/get/mycontent/',
                body: {},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(404);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe('RESOURCE_NOT_FOUND');
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('Success', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json', 'cid': '12'},
                uri: base_url + '/get/mycontent/' + userId,
                body: {},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                expect(body.result.content).toBeDefined();
                done();
            });
        });
    });

});