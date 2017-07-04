var request = require('request');
var host = "http://localhost:5000";
var base_url = host + "/api/sb/v1/notes";
var noteId = '592bf0b256c5e44194d4183b';

describe("Note Search services", function () {

    it('Failed due to missing cid in headers', function (done) {
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

    it('Failed due to invalid request object', function (done) {
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

    it('Failed due to invalid request filter object', function (done) {
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


    it('should search the note', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/search',
            body: {
                "request": {
                    "query": "Note",
                    "filters": {}
                }
            },
            json: true
        }, function (error, response, body) {
            expect(response.statusCode).toBe(200);
            expect(body).toBeDefined();
            expect(body.responseCode).toBe("OK");
            expect(body.result).toBeDefined();
            expect(body.result.note).toBeDefined();
            done();
        });
    });
});

describe("Create note service", function () {

    it('Failed due to missing cid in headers', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json'},
            uri: base_url + '/create',
            body: {
                "request": {
                    "note": {
                        "title": "Note Title",
                        "note": "Note Description"
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
                    "note": {
                        "title": "Note Title",
                        "note": "Note Description"
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

    it('Failed due to missing note object', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/create',
            body: {
                "request": {
                    "note1": {
                        "title": "Note Title",
                        "note": "Note Description"
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

    it('Failed due to missing required field title', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/create',
            body: {
                "request": {
                    "note": {
                        "note": "Note Description"
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

    it('Failed due to missing required field note', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/create',
            body: {
                "request": {
                    "note": {
                        "title": "Note Title"
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
    
    it('Failed due to missing required field userid', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/create',
            body: {
                "request": {
                    "note": {
                        "title": "Note Title",
                         "note": "Note Description"
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
    
    it('Failed due to missing required field contentId or courseId', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/create',
            body: {
                "request": {
                    "note": {
                        "title": "Note Title",
                         "note": "Note Description",
                         "userid" : "1234567"
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

    it('should create note success', function (done) {
        request.post({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/create',
            body: {
                "request": {
                    "note": {
                        "title": "Note Title",
                        "note": "Note Description",
                        "userId" : "1234567",
                        "courseId" : "1231233"
                    }
                }
            },
            json: true
        }, function (error, response, body) {
            expect(response.statusCode).toBe(200);
            expect(body).toBeDefined();
            expect(body.responseCode).toBe("OK");
            expect(body.result).toBeDefined();
            expect(body.result.note.identifier).toBeDefined();
            noteId = body.result.note.identifier;
            done();
        });
    });
});

describe("Get Note Service", function () {
    it('Failed due to missing cid in headers', function (done) {

        request.get({
            headers: {'Content-Type': 'application/json'},
            uri: base_url + '/get/' + noteId,
            json: true
        }, function (error, response, body) {
            expect(response.statusCode).toBe(400);
            expect(body).toBeDefined();
            expect(body.responseCode).toBe("CLIENT_ERROR");
            expect(body.result).toBeDefined();
            done();
        });
    });

    it('Failed due to missing or invalid note ID', function (done) {
        request.get({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/get/' + noteId + 'dssdf',
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
            uri: base_url + '/get/' + noteId,
            json: true
        }, function (error, response, body) {
            expect(response.statusCode).toBe(200);
            expect(body).toBeDefined();
            expect(body.responseCode).toBe("OK");
            expect(body.result).toBeDefined();
            expect(body.result.note).toBeDefined();
            done();
        });
    });
});

describe("Update Note Service", function () {
    it('Failed due to missing cid in headers', function (done) {

        request.patch({
            headers: {'Content-Type': 'application/json'},
            uri: base_url + '/update/' + noteId,
            body: {
                "request": {
                    "note": {
                        "title": "Note Title"
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

    it('Failed due to missing or invalid note ID', function (done) {
        request.patch({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/update/' + noteId + 'dssdf',
            body: {
                "request": {
                    "note": {
                        "title": "Note Title"
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
    
    it('Success', function (done) {
        var title = "Updated Title";
        request.patch({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/update/' + noteId,
            body: {
                "request": {
                    "note": {
                        "title": title
                    }
                }
            },
            json: true
        }, function (error, response, body) {
            expect(response.statusCode).toBe(200);
            expect(body).toBeDefined();
            expect(body.responseCode).toBe("OK");
            expect(body.result).toBeDefined();
            expect(body.result.note).toBeDefined();
            expect(body.result.note.title).toBe(title);
            done();
        });
    });
});


describe("Remove Note Service", function () {
    
    it('Failed due to missing cid in headers', function (done) {

        request.delete({
            headers: {'Content-Type': 'application/json'},
            uri: base_url + '/delete/' + noteId,
            json: true
        }, function (error, response, body) {
            expect(response.statusCode).toBe(400);
            expect(body).toBeDefined();
            expect(body.responseCode).toBe("CLIENT_ERROR");
            expect(body.result).toBeDefined();
            done();
        });
    });

    it('Failed due to missing or invalid note ID', function (done) {
        request.delete({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/delete/' + noteId + 'dssdf',
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
        request.delete({
            headers: {'Content-Type': 'application/json', 'cid': '12'},
            uri: base_url + '/delete/' + noteId,
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
