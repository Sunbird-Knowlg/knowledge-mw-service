exports.collaboratorServiceTestData = {
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
            "request": {
                content: {}
            }
        },
        get: function () {
            return 'mock Channel ID'
        },
    },
    "ERROR_RESPONSE": {
        "responseCode": "RESOURCE_NOT_FOUND",
        params: {
            errmsg: "mock error",
            err: "error1"
        },
        statusCode: 500,
        result: {}
    },
    "SUCCESS_RESPONSE": {
        "responseCode": "OK",
        "result": {
            "content": {}
        }
    },
    "SUCCESS_RESPONSE_DRAFT_STATUS": {
        "responseCode": "OK",
        "result": {
            "content": {status: "Draft"}
        }
    }
};
