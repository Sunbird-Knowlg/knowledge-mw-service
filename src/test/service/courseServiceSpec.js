var request = require('request');
var host = "http://localhost:5000";
var base_url = host + "/v1/course";
var courseId = 'do_2123277638089523201167';
var versionKey = '1504853980585';

describe("Course", function () {

    describe("search service", function () {

        it('should failed search courses due to invalid request object', function (done) {
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
        it('should failed search courses due to invalid request filter object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
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
                expect(body.result.count).toBeDefined();
                if(body.result.count > 0) {
                    expect(body.result.course).toBeDefined();
                }
                done();
            });
        });
    });
    describe("create service", function () {

        it('should failed due to missing request object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
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
        it('should failed due to missing course object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
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
        it('should failed due to missing required field name', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
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
        it('should failed due to missing required field description', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
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
        it('should success', function (done) {
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
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                courseId = body.result.course_id;
                versionKey = body.result.versionKey;
                console.log(courseId, versionKey);
                done();
            });
        });
    });
    describe("update service", function () {

        it('Failed due to missing request object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
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
                console.log(body);
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });
        it('Failed due to missing course object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/update/' + courseId,
                body: {
                    "request": {
                        "course": {
                            "name": "Course Name Update",
                            "versionKey": versionKey
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
    describe("get service", function () {
        
        it('Failed due to invalid course ID', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/read/' + courseId + 'dssdf',
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
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/read/' + courseId,
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
    describe("Review Service", function () {
        it('Failed due to missing or invalid course ID', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/review/' + courseId + 'dssdf',
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
            request.post({
                headers: {'Content-Type': 'application/json'},
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
    xdescribe("Publish Service", function () {
        it('Failed due to missing or invalid course ID', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/publish/' + courseId + 'dssdf',
                body: {},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(404);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });
        xit('Success', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/publish/' + courseId,
                body: {request: {course: { lastPublishedBy : "test"}}},
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
    describe("Get User Service", function () {
        var userId = "263";
        it('Success', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/read/mycourse/' + userId,
                body: {},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("OK");
                expect(body.result).toBeDefined();
                expect(body.result.count).toBeDefined();
                if(body.result.count > 0) {
                    expect(body.result.course).toBeDefined();
                }
                done();
            });
        });
    });
    describe("Get Hierarchy Course Service", function () {
        it('Failed due to missing or invalid course ID', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
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
});