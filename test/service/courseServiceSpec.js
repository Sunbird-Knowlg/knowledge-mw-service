var request = require('request');
describe("Course services", function () {

    var host = "http://localhost:5000";
    var base_url = host + "/api/sb/v1/course";

    it('should search courses failed due to missing cid in headers', function (done) {
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

    it('should failed search courses due to invalid request object', function (done) {
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

    it('should failed search courses due to invalid request filter object', function (done) {
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


    it('should search the courses', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/search',
            body: {
                "request": {
                    "query" : "Test",
                    "filters": {}
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

    it('should failed create courses due to missing cid in headers', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json'},
            uri: base_url + '/create',
            body: {
                "request": {
                    "course": {
                        "name": "Course Name",
                        "description": "Course Description"
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

    it('should create course failed due to missing request object', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/create',
            body: {
                "request1": {
                    "course": {
                        "name": "Course Name",
                        "description": "Course Description"
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

    it('should create course failed due to missing course object', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/create',
            body: {
                "request": {
                    "course1": {
                        "name": "Course Name",
                        "description": "Course Description"
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
    
    it('should create course failed due to missing required field name', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/create',
            body: {
                "request": {
                    "course": {
                        "description": "Course Description"
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

    it('should create course failed due to missing required field description', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/create',
            body: {
                "request": {
                    "course": {
                        "name": "Course Name"
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

    xit('should create course success', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/create',
            body: {
                "request": {
                    "course": {
                        "name": "Course Name",
                        "description": "Course Description"
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




})
