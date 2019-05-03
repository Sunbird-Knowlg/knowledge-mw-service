exports.contentServiceTestData = {
    "REQUEST": {
        headers: {
            "x-authenticated-userid": "mock user id"
        },
        "rspObj": {
            "apiId": "api.create.flag1",
            "path": "create/flag",
            "apiVersion": "1.1",
            "msgid": "weeqw112312",
            "result": {}
        },
        "params": {
            "contentId": "mock content ID"
        },
        query: {},
        "body": {
            "request": {
                "content": {
                    name: 'mock name',
                    mimeType: 'mock mimetype',
                    contentType: 'mock content type',
                    createdBy: 'mock creator',
                    lastPublishedBy: "mock publisher",
                    fileName: "mock file Name",
                    badgeAssertion: {},
                },
                contentIds: [],
                "filters": {}
            },
        },
        get: function () {
            return 'mock ID'
        }
    },
    "UPDATE_REQUEST": {
        "rspObj": {
            "apiId": "api.create.flag",
            "path": "create/flag",
            "apiVersion": "1.1",
            "msgid": "weeqw112312",
            "result": {}
        },
        "params": {},
        "body": {
            "request": {
                "content": {
                    "versionKey": "mock version Key"
                }
            },
        }
    },
    "ERROR_RESPONSE": {
        "responseCode": "RESOURCE_NOT_FOUND",
        params: {errmsg: "mock error"}
    },
    "SUCCESS_RESPONSE": {
        "responseCode": "OK",
        "statusCode": 200,
        "result": {
            "node_id": "mock Node ID",
            "versionKey": "mock version Key"
        }
    },
    "SUCCESS_RESPONSE_GET_CONTENT_API": {
        "responseCode": "OK",
        "statusCode": 200,
        "result": {
            content: {
                assets: {}
            },
            "node_id": "mock Node ID",
            "versionKey": "mock version Key"
        }
    },
    "UPDATE_SUCCESS_RESPONSE": {
        result: {
            content: {
                versionKey: "mock version Key",
                node_id: "mock Node ID"
            }
        },
        "responseCode": "OK",
        "statusCode": 200,
    },
    "REVIEW_SUCCESS_RESPONSE": {
        result: {
            versionKey: "mock version Key",
            node_id: "mock Node ID"
        },
        "responseCode": "OK",
        "statusCode": 200,
    },
    "PUBLISH_SUCCESS_RESPONSE": {
        result: {
            versionKey: "mock version Key",
            node_id: "mock Node ID",
            publishStatus: "mock status"
        },
        "responseCode": "OK",
        "statusCode": 200,
    },
    "GET_CONTENT_SUCCESSS_RESPONSE": {
        result: {
            content: {
                status: "mock status"
            }
        },
        "responseCode": "OK",
        params: {}
    },
    "GET_CONTENT_VALIDATED_DRAFT_RESPONSE": {
        result: {
            content: {
                status: "Draft",
                createdBy: 'mock ID',
                collaborators: ['mock ID']
            }
        },
        "responseCode": "OK",
        params: {}
    },
    "GET_CONTENT_SUCCESS_DRAFT_RESPONSE": {
        result: {
            content: {
                status: "Draft",
            }
        },
        "responseCode": "OK",
        params: {}
    },
    "DRAFT_REQUEST": {
        "rspObj": {
            "apiId": "api.create.flag1",
            "path": "create/flag",
            "apiVersion": "1.1",
            "msgid": "weeqw112312",
            "result": {}
        },
        "params": {
            "contentId": "mock content ID"
        },
        "body": {
            "request": {
                apiName: "retireLock",
                "content": {
                    name: 'mock name',
                    mimeType: 'mock mimetype',
                    contentType: 'mock content type',
                    createdBy: 'mock ID',
                    lastPublishedBy: "mock publisher",
                    fileName: "mock file Name",
                    collaborators: ['mock ID']
                },
                "filters": {}
            },
        },
        get: function () {
            return 'mock ID'
        }
    },


};
