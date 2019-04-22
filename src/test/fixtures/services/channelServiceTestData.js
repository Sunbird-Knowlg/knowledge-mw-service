exports.channelServiceTestData = {

    "REQUEST": {
        "rspObj": {
            "apiId": "api.create.flag",
            "path": "create/flag",
            "apiVersion": "1.1",
            "msgid": "weeqw112312",
            "result": {}
        },
        "params": {
            "channelId": "mock Channel ID"
        },
        "body": {
            "request": {}
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
        "result": {
            "content": {}
        }
    }
};
