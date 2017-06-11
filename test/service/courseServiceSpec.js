var request = require('request');
var host = "http://localhost:5000";
var base_url = host + "/api/sb/v1/course";

describe("Course Search services", function () {

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
            done();
        });
    });
});

describe("Create course service", function () {

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

});

describe("Update Course Service", function () {
    var courseId = "do_112240785235501056165";
    it('Failed due to missing cid in headers', function (done) {

        request.patch({
            headers: {'Content-Type': 'application/json'},
            uri: base_url + '/update/' + courseId,
            body: {
                "request": {
                    "course": {
                        "name": "Course Name Update",
                        "description": "Course Description update"
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
            uri: base_url + '/update/' + courseId,
            body: {
                "request1": {
                    "course": {
                        "name": "Course Name Update",
                        "description": "Course Description update"
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

    it('Failed due to missing course object', function (done) {
        request.patch({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/update/' + courseId,
            body: {
                "request": {
                    "course1": {
                        "name": "Course Name Update",
                        "description": "Course Description update"
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
            uri: base_url + '/update/' + courseId,
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

    it('Update course success', function (done) {
        request.patch({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/update/' + courseId,
            body: {
                "request": {
                    "course": {
                        "name": "Course Name Update",
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

describe("Get Course Service", function () {
    var courseId = "do_112240785235501056165";
    it('Failed due to missing cid in headers', function (done) {

        request.get({
            headers: {'Content-Type': 'application/json'},
            uri: base_url + '/get/' + courseId,
            json: true
        }, function (error, response, body) {
            expect(response.statusCode).toBe(400);
            expect(body).toBeDefined();
            expect(body.responseCode).toBe("CLIENT_ERROR");
            expect(body.result).toBeDefined();
            done();
        });
    });

    it('Failed due to missing or invalid course ID', function (done) {
        request.get({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/get/' + courseId + 'dssdf',
            json: true
        }, function (error, response, body) {
            expect(response.statusCode).toBe(404);
            expect(body).toBeDefined();
            expect(body.responseCode).toBe("RESOURCE_NOT_FOUND");
            expect(body.result).toBeDefined();
            done();
        });
    });
    
    it('Success', function (done) {
        request.get({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/get/' + courseId,
            json: true
        }, function (error, response, body) {
            expect(response.statusCode).toBe(200);
            expect(body).toBeDefined();
            expect(body.responseCode).toBe("OK");
            expect(body.result).toBeDefined();
            expect(body.result.course).toBeDefined();
            done();
        });
    });
});


describe("Review Course Service", function () {
    var courseId = "do_112240785235501056165";
    it('Failed due to missing cid in headers', function (done) {

        request.post({
            headers: {'Content-Type': 'application/json'},
            uri: base_url + '/review/' + courseId,
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

    it('Failed due to missing or invalid course ID', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/review/' + courseId + 'dssdf',
            body: {},
            json: true
        }, function (error, response, body) {
            expect(response.statusCode).toBe(404);
            expect(body).toBeDefined();
            expect(body.responseCode).toBe("SERVER_ERROR");
            expect(body.result).toBeDefined();
            done();
        });
    });
    
    xit('Success', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/review/' + courseId,
            body: {},
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

describe("Publish Course Service", function () {
    var courseId = "do_112240785235501056165";
    it('Failed due to missing cid in headers', function (done) {

        request.get({
            headers: {'Content-Type': 'application/json'},
            uri: base_url + '/publish/' + courseId,
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

    it('Failed due to missing or invalid course ID', function (done) {
        request.get({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/publish/' + courseId + 'dssdf',
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
    
    it('Success', function (done) {
        request.get({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/publish/' + courseId,
            body: {},
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

describe("Get  MyCourse Service", function () {
    var userId = "263";
    it('Failed due to missing cid in headers', function (done) {

        request.get({
            headers: {'Content-Type': 'application/json'},
            uri: base_url + '/get/mycourse/' + userId,
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

    it('Failed due to missing or invalid course ID', function (done) {
        request.get({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/get/mycourse/',
//            uri: base_url + '/publish/' + userId + 'dssdf',
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
            uri: base_url + '/get/mycourse/' + userId,
            body: {},
            json: true
        }, function (error, response, body) {
            expect(response.statusCode).toBe(200);
            expect(body).toBeDefined();
            expect(body.responseCode).toBe("OK");
            expect(body.result).toBeDefined();
            expect(body.result.course).toBeDefined();
            done();
        });
    });
});

describe("Get Hierarchy Course Service", function () {
    var courseId = "do_112240785235501056165";
    it('Failed due to missing cid in headers', function (done) {

        request.get({
            headers: {'Content-Type': 'application/json'},
            uri: base_url + '/hierarchy/' + courseId,
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

    it('Failed due to missing or invalid course ID', function (done) {
        request.get({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/hierarchy/' + courseId + 'dssdf',
            body: {},
            json: true
        }, function (error, response, body) {
            expect(response.statusCode).toBe(404);
            expect(body).toBeDefined();
            expect(body.responseCode).toBe("RESOURCE_NOT_FOUND");
            expect(body.result).toBeDefined();
            done();
        });
    });
    
    it('Success', function (done) {
        request.get({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/hierarchy/' + courseId,
            body: {},
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