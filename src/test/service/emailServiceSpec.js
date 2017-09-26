var emailService = require("../../service/emailService.js");

describe("Email service", function() {

    it("Create flag email", function(done) {
        var req = {

            rspObj: {
                apiId: 'api.create.flag',
                path: 'create/flag',
                apiVersion: '1.1',
                msgid: 'weeqw112312',
                result: {}
            },
            params: {
                contentId: "do_2123229899985715201688"
            },
            body: {
                request: {}
            },

        }

        emailService.createFlagContentEmail(req, function(err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log(res);
            }
            done();
        });
    });

    it("Accept flag email", function(done) {
        var req = {

            rspObj: {
                apiId: 'api.create.flag',
                path: 'create/flag',
                apiVersion: '1.1',
                msgid: 'weeqw112312',
                result: {}
            },
            params: {
                contentId: "do_2123229899985715201688"
            },
            body: {
                request: {}
            },

        }

        emailService.acceptFlagContentEmail(req, function(err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log(res);
            }
            done();
        });
    });

    it("Reject flag email", function(done) {
        var req = {

            rspObj: {
                apiId: 'api.create.flag',
                path: 'create/flag',
                apiVersion: '1.1',
                msgid: 'weeqw112312',
                result: {}
            },
            params: {
                contentId: "do_2123229899985715201688"
            },
            body: {
                request: {}
            },

        }

        emailService.rejectFlagContentEmail(req, function(err, res) {
            if (err) {
                console.log(err);
            } else {
                console.log(res);
            }
            done();
        });
    });
});