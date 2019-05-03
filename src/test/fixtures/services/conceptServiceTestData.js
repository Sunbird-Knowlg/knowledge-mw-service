exports.conceptServiceTestData = {

    "REQUEST": {
        "rspObj": {
            "apiId": "api.create.flag",
            "path": "create/flag",
            "apiVersion": "1.1",
            "msgid": "weeqw112312",
            "result": {}
        },
        "params": {
            "channelId": "mock Channel ID",
            "domainId": "mock Domain ID",
            "objectType": "mock object Type",
            "objectId": "mock object Id",
            "conceptId": "mock conceptId",
        },
        "body": {
            "request": {
                "search": "mock search string",
                "object": "mock object"
            },
        },
        get: function () {
            return 'mock Channel ID'
        },
    },
    "ERROR_RESPONSE": {
        "responseCode": "RESOURCE_NOT_FOUND"
    },
    "SUCCESS_RESPONSE": {
        "responseCode": "OK",
        "statusCode": 200,
        "result": {
            "content": {}
        }
    }
};
