var request = require('request');

var host = "http://localhost:5000";
var base_url = host + "/v1/content";

//This function used to create content and 
function createContent() {
    request.post({
        headers: {'Content-Type': 'application/json'},
        uri: base_url + '/create',
        body: {
            "request": {
                "content": {
                    "name": "Content Name",
                    "description": "Content Description",
                    "mimeType": "application/pdf",
                    "contentType": "Story"
                }
            }
        },
        json: true
    }, function (error, response, body) {
        return body.result.content_id;
    });
}

function getContentByStatus(status, callback) {
    request.post({
        headers: {'Content-Type': 'application/json'},
        uri: base_url + '/search',
        body: {
            "request": {
                "filters": {
                    status : status
                }
            }
        },
        json: true
    }, function (error, response, body) {
        return callback(error, body.result.content[0]);
    });
}

describe("Composite search services", function () { 
 
    it('Failed due to empty body', function (done) { 
        request.post({ 
            headers: {'Content-Type': 'application/json'}, 
            uri: base_url + '/search', 
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
            expect(body.result.content).toBeDefined(); 
            done(); 
        }); 
    }); 
}); 


describe("Content", function () {

    describe("search services", function () {

        it('should search content failed due to invalid request object', function (done) {
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

        it('Failed search content due to missing filter object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/search',
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

        it('Failed search content due to invalid filter object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/search',
                body: {
                    "request": {
                        "filter1": {}
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
                expect(body.result.content).toBeDefined();
                done();
            });
        });
    });

    describe("create service", function () {

        it('Failed due to missing request object in body', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/create',
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

        it('Failed due to missing or invalid request object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
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

        it('Failed due to missing or invalid content object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/create',
                body: {
                    "request": {
                        "content": {
                            "name": "Content Name",
                            "description": "Content Description",
                            "mimeType": "application/pdf"
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

        it('should create content success', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/create',
                body: {
                    "request": {
                        "content": {
                            "name": "Content Name",
                            "description": "Content Description",
                            "mimeType": "application/pdf",
                            "contentType": "Story",
                            "createdBy" : "Test"
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

    xdescribe("update service", function () {
        var contentId = "do_212327128776556544182";
        it('Failed due to missing or invalid request object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
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

        it('Failed due to missing or invalid content object', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
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
                headers: {'Content-Type': 'application/json'},
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

        it('Update content success', function (done) {
            request.patch({
                headers: {'Content-Type': 'application/json'},
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

    xdescribe("get service", function () {
        var contentId = "do_212327128776556544182";
        
        it('Failed due to missing or invalid content ID', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
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

        it('Success', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
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

    xdescribe("review service", function () {
        var contentId = "do_212327063701544960179";

        it('Failed due to missing or invalid content ID', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/review/' + contentId + 'dssdf',
                body: {},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(400);
                done();
            });
        });

        it('Success', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/review/' + contentId,
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

    xdescribe("publish service", function () {
        var contentId = "do_212327063701544960179";
        it('Failed due to missing or invalid request object', function (done) {

            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/publish/' + contentId,
                body: {request: {}},
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
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/publish/' + contentId + 'dssdf',
                body: {request: {lastPublishedBy : "349"}},
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
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/publish/' + contentId,
                body: {request: {content : {lastPublishedBy : "349"}}},
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

    describe("get myContent service", function () {
        var userId = "e886f4a8-890e-4e73-adc2-5afebad93c08";

        it('Count 0 due to invalid user Id', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/read/mycontent/' + userId + 'fsdfdsff',
                body: {},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe('OK');
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('Success', function (done) {
            request.get({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/read/mycontent/' + userId,
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

    xdescribe("retire service", function () {
        var contentIds = ["do_212327128776556544182ff"];

        it('Failed due to missing or invalid request object', function (done) {
            request.delete({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/retire',
                body: {request : {}},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });
        var contentIds = ["do_212327063701544960179"];
        it('Failed due to missing or invalid contentIds key', function (done) {
            request.delete({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/retire',
                body: {request : {contentId : contentIds}},
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
            request.delete({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/retire',
                body: {request : {contentIds : contentIds}},
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

    xdescribe("reject service", function () {
        var contentId = "do_212326355637837824131";

        it('Failed due to missing or invalid contentId', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/reject/' + contentId + 'ff',
                body: {request : {}},
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
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/reject/' + createContent(),
                body: {request : {}},
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

    describe("create flag service", function () {
        var contentId = "do_20043627";

        it('Failed due to missing or invalid request object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/flag/' + contentId + 'ff',
                body: {request1 : {}},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('Failed due to missing required fields', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/flag/' + contentId,
                body: {request : {flaggedReasons: ["Copyright Violation"], flaggedBy: "Test case", flags: ["Test case"] }},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('Failed due to invalid contentId', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/flag/' + contentId + 'ff',
                body: {request : {flaggedReasons: ["Copyright Violation"], flaggedBy: "Test case", flags: ["Test case"], versionKey: "31312314" }},
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
                getContentByStatus("Live", function(err, content) {
                    request.post({
                    headers: {'Content-Type': 'application/json'},
                    uri: base_url + '/flag/' + content.identifier,
                    body: {request : {flagReasons: ["Copyright Violation"], flaggedBy: "Test case", flags: ["Test case"], versionKey: content.versionKey }},
                    json: true
                }, function (error, response, body) {
                    
                    expect(response.statusCode).toBe(200);
                    expect(body).toBeDefined();
                    expect(body.responseCode).toBe("OK");
                    expect(body.result).toBeDefined();
                    done();
                });
            })
        });
    });

    xdescribe("accept flag service", function () {
        var contentId = "do_20043627";

        it('Failed due to invalid request object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/flag/accept/' + contentId,
                body: {request : {}},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('Failed due to invalid contentId', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/flag/accept/' + contentId + '123',
                body: {request : {versionKey : "23434234234"}},
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
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/flag/accept/' + contentId,
                body: {request : {versionKey : "1504844754263"}},
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

    xdescribe("reject flag service", function () {
        var contentId = "do_20043627";

        it('Failed due to invalid or missing request object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/flag/reject/' + contentId,
                body: {request1 : {}},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('Failed due to invalid contentId', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/flag/reject/' + contentId + '123',
                body: {request : {versionKey : "23434234234"}},
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
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/flag/reject/' + contentId,
                body: {request : {versionKey : "1504844754263"}},
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

    xdescribe("get pre-signed url Service", function () {
        var contentId = "do_20043627";

        it('Failed due to invalid or missing request object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/upload/url/' + contentId,
                body: {request1 : {content: {}}},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('Failed due to invalid or missing content object', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/upload/url/' + contentId,
                body: {request : {content1: {}}},
                json: true
            }, function (error, response, body) {
                expect(response.statusCode).toBe(400);
                expect(body).toBeDefined();
                expect(body.responseCode).toBe("CLIENT_ERROR");
                expect(body.result).toBeDefined();
                done();
            });
        });

        it('Failed due to missing required fields', function (done) {
            request.post({
                headers: {'Content-Type': 'application/json'},
                uri: base_url + '/upload/url/' + contentId,
                body: {request : {content: {fileName1: "test.pdf"}}},
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
                uri: base_url + '/upload/url/' + contentId,
                body: {request : {content: {fileName: "test.pdf"}}},
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