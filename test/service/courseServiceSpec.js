describe("Course services", function() {
    var courseService  = require('../service/courseService');
    var base_url = "http://localhost:5000/api/sb/v1/course"
    it('should search the courses', function(done) {
        request.post({
            headers: { 'Content-Type': 'application/json' },
            uri: base_url + '/search',
            body: {
                "request": {
                    "filters": {},
                    "offset": 0,
                    "limit": 5
                }
            },
            json: true
        }, function(error, response, body) {
            expect(response.statusCode).toBe(200);
            expect(body).toBeDefined();
            done();
        });
    });


    it('should search courses by createdBy', function() {
        
    });
})
