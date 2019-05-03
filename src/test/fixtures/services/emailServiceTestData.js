exports.emailServiceTestData = {

    "PUBLISHED_CONTENT": {
        "subject": "Congratulations, your content is live! Content Type: {{Content type}}, Title: {{Content title}}",
        "body": "Congratulations! The content that you had submitted has been accepted for publication. It will be available for usage shortly. <br><br> <b>Content Type: </b>{{Content type}}<br> <b>Title: </b>{{Content title}}<br>",
        "template": "publishContent"
    },

    "REQUEST": {
        "rspObj": {
            "apiId": "api.create.flag",
            "path": "create/flag",
            "apiVersion": "1.1",
            "msgid": "weeqw112312",
            "result": {}
        },
        "params": {
            "contentId": "mock Content ID"
        },
        "body": {
            "request": {}
        },
        get: function () {
            return 'mock Channel ID'
        },
        headers: {}
    },
    "ErrorResponse": {
        "responseCode": "RESOURCE_NOT_FOUND"
    },
    "SuccessResponse": {
        "responseCode": "OK",
        "result": {
            "content": {}
        }
    }


};
