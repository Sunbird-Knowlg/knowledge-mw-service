exports.courseServiceTestData = {
    "REQUEST": {
        "rspObj": {
            "apiId": "api.create.flag",
            "path": "create/flag",
            "apiVersion": "1.1",
            "msgid": "weeqw112312",
            "result": {}
        },
        "params": {
            "courseId": "mock courseId"
        },
        "body": {
            "request": {
                course: {
                    name: "mock Name",
                    description: " mock description",
                    versionKey: "mock verison key",
                    lastPublishedBy: "mock publisher"
                }
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
            node_id: "mock Node ID",
            versionKey: "mock version key",
            publishStatus: "mock status"
        }
    },
    "UPDATE_SUCCESS_RESPONSE": {
        "responseCode": "OK",
        "result": {
            content: {
                node_id: "mock Node ID",
                versionKey: "mock version key",
            }
        }
    },
    "SUCCESS_RESPONSE_DRAFT_STATUS": {
        "responseCode": "OK",
        "result": {
            "content": {status: "Draft"}
        }
    }
};
