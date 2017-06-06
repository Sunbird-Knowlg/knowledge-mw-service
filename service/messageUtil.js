exports.COURSE = {

    SEARCH: {
        MISSING_CODE: "ERR_COURSE_SEARCH_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for search course are missing",
        FAILED_CODE: "ERR_COURSE_SEARCH_FAILED",
        FAILED_MESSAGE: "Search course failed"
    },

    CREATE: {
        MISSING_CODE: "ERR_COURSE_CREATE_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for create course are missing",
        FAILED_CODE: "ERR_COURSE_CREATE_FAILED",
        FAILED_MESSAGE: "Create course failed"
    },

    UPDATE: {
        MISSING_CODE: "ERR_COURSE_UPDATE_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for update course are missing",
        FAILED_CODE: "ERR_COURSE_UPDATE_FAILED",
        FAILED_MESSAGE: "Update course failed"
    },

    REVIEW: {
        MISSING_CODE: "ERR_COURSE_REVIEW_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for review course are missing",
        FAILED_CODE: "ERR_COURSE_REVIEW_FAILED",
        FAILED_MESSAGE: "Review course failed"
    },

    PUBLISH: {
        FAILED_CODE: "ERR_COURSE_PUBLISH_FAILED",
        FAILED_MESSAGE: "Publish course failed"
    },

    GET: {
        FAILED_CODE: "ERR_COURSE_GET_FAILED",
        FAILED_MESSAGE: "Get course failed"
    },

    GET_MY: {
        FAILED_CODE: "ERR_COURSE_GET_MY_FAILED",
        FAILED_MESSAGE: "Get my course failed"
    },

    HIERARCHY: {
        MISSING_CODE: "ERR_COURSE_HIERARCHY_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for get course hierarchy are missing",
        FAILED_CODE: "ERR_COURSE_HIERARCHY_FAILED",
        FAILED_MESSAGE: "Get course hierarchy failed"
    },

    MIME_TYPE: "application/vnd.ekstep.content-collection",
    CONTENT_TYPE: "TextBook"
};

exports.CONTENT = {

    SEARCH: {
        MISSING_CODE: "ERR_CONTENT_SEARCH_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for search content are missing",
        FAILED_CODE: "ERR_CONTENT_SEARCH_FAILED",
        FAILED_MESSAGE: "Search content failed"
    },

    CREATE: {
        MISSING_CODE: "ERR_CONTENT_CREATE_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for create content are missing",
        FAILED_CODE: "ERR_CONTENT_CREATE_FAILED",
        FAILED_MESSAGE: "Create content failed"
    },

    UPDATE: {
        MISSING_CODE: "ERR_CONTENT_UPDATE_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for update content are missing",
        FAILED_CODE: "ERR_CONTENT_UPDATE_FAILED",
        FAILED_MESSAGE: "Update content failed"
    },

    UPLOAD: {
        MISSING_CODE: "ERR_CONTENT_UPLOAD_FILES_MISSING",
        MISSING_MESSAGE: "Required files for upload content are missing",
        FAILED_CODE: "ERR_CONTENT_UPLOAD_FAILED",
        FAILED_MESSAGE: "Upload content failed"
    },

    REVIEW: {
        MISSING_CODE: "ERR_CONTENT_REVIEW_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for review content are missing",
        FAILED_CODE: "ERR_CONTENT_REVIEW_FAILED",
        FAILED_MESSAGE: "Review content failed"
    },

    PUBLISH: {
        FAILED_CODE: "ERR_CONTENT_PUBLISH_FAILED",
        FAILED_MESSAGE: "Publish content failed"
    },

    GET: {
        FAILED_CODE: "ERR_CONTENT_GET_FAILED",
        FAILED_MESSAGE: "Get content failed"
    },

    GET_MY: {
        FAILED_CODE: "ERR_CONTENT_GET_MY_FAILED",
        FAILED_MESSAGE: "Get my content failed"
    },

    CONTENT_TYPE: [
        "Story",
        "Worksheet",
        "Game",
        "Simulation",
        "Puzzle",
        "Diagnostic",
        "Template",
        "Plugin",
        "ContentTemplate",
        "ItemTemplate",
        "Collection"
    ],

    MIME_TYPE: [
        "application/vnd.ekstep.ecml-archive",
        "application/vnd.ekstep.html-archive",
        "application/vnd.android.package-archive",
        "application/vnd.ekstep.content-archive",
        "application/vnd.ekstep.plugin-archive",
        "application/octet-stream",
        "application/msword",
        "application/pdf",
        "video/youtube",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/tiff",
        "image/bmp",
        "image/gif",
        "image/svg+xml",
        "video/avi",
        "video/mpeg",
        "video/quicktime",
        "video/3gpp",
        "video/mpeg",
        "video/mp4",
        "video/ogg",
        "video/webm",
        "audio/mp3",
        "audio/mp4",
        "audio/mpeg",
        "audio/ogg",
        "audio/webm",
        "audio/x-wav",
        "audio/wav"
    ]
};

exports.REQUEST = {

    PARAMS: {
        MISSING_CID_CODE: "ERR_REQUEST_FIELDS_CID_MISSING",
        MISSING_CID_MESSAGE: "Required fields consumer id is missing"
    }

};

exports.RESPONSE_CODE = {
    CLIENT_ERROR: "CLIENT_ERROR",
    SERVER_ERROR: "SERVER_ERROR",
    SUCCESS: "OK",
    RESOURSE_NOT_FOUND: "RESOURCE_NOT_FOUND"
};

exports.API_VERSION = {
    V1: "1.0"
};

exports.UTILS = {
    UPLOAD: {
        MISSING_CODE: "ERR_MEDIA_UPLOAD_FILES_MISSING",
        MISSING_MESSAGE: "Required files for upload media are missing",
        FAILED_CODE: "ERR_MEDIA_UPLOAD_FAILED",
        FAILED_MESSAGE: "Upload media failed"
    },
    RESOURCE_BUNDLE: {
        MISSING_CODE: "ERR_GET_RESOURCE_BUNDLE_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for get resource language are missing",
        FAILED_CODE: "ERR_GET_RESOURCE_BUNDLE_FAILED",
        FAILED_MESSAGE: "Get resource bundle failed"
    }
};

exports.NOTES= {

    CREATE: {
        MISSING_CODE: "ERR_NOTE_CREATE_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for create notes are missing",
        FAILED_CODE: "ERR_NOTE_CREATE_FAILED",
        FAILED_MESSAGE: "Create notes failed"
    },
    
    GET: {
        MISSING_CODE: "ERR_NOTE_GET_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for get note detail are missing",
        FAILED_CODE: "ERR_NOTE_GET_FAILED",
        FAILED_MESSAGE: "Get note detail failed"
    },
    
    UPDATE: {
        MISSING_CODE: "ERR_NOTE_UPDATE_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for update note are missing",
        FAILED_CODE: "ERR_NOTE_UPDATE_FAILED",
        FAILED_MESSAGE: "Update note failed"
    },
    
    SEARCH: {
        MISSING_CODE: "ERR_NOTE_SEARCH_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for search note are missing",
        FAILED_CODE: "ERR_NOTE_SEARCH_FAILED",
        FAILED_MESSAGE: "Search note failed"
    },
    
    DELETE: {
        MISSING_CODE: "ERR_NOTE_DELETE_FIELDS_MISSING",
        MISSING_MESSAGE: "Required fields for delete note are missing",
        FAILED_CODE: "ERR_NOTE_DELETE_FAILED",
        FAILED_MESSAGE: "Delete note failed"
    }
};
