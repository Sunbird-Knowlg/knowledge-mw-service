/**
 * @file  : notesService.js
 * @author: Anuj Gupta
 * @desc  : controller file for handle user notes. 
 */

var async = require('async');
var notesMongoModel = require('../mongooseModels/notesModel.js');
var notesReqModel = require('../models/notesModel.js').NOTES;
var validatorUtil = require('sb_req_validator_util');
var messageUtils = require('./messageUtil');
var respUtil = require('response_util');

var notesMessage = messageUtils.NOTES;
var responseCode = messageUtils.RESPONSE_CODE;

/**
 * this function help to create new note. First we check all required fields, then wer save.
 * @param {Object} request
 * @param {Object} response
 */
function createNotesAPI(request, response) {

    var data = request.body;
    var noteData = data.request ? data.request.note : {};
    var rspObj = request.rspObj;

    if (!data.request || !noteData || !validatorUtil.validate(noteData, notesReqModel.CREATE) || !(noteData.courseId || noteData.contentId)) {
        rspObj.errCode = notesMessage.CREATE.MISSING_CODE;
        rspObj.errMsg = notesMessage.CREATE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    var newNote = new notesMongoModel({
        userId: noteData.userId,
        courseId: noteData.courseId,
        contentId: noteData.contentId,
        note: noteData.note,
        title: noteData.title,
        tags: noteData.tags
    });

    newNote.save(function(err) {
        if (err) {
            rspObj.errCode = notesMessage.CREATE.FAILED_CODE;
            rspObj.errMsg = notesMessage.CREATE.FAILED_MESSAGE;
            rspObj.responseCode = responseCode.SERVER_ERROR;
            return response.status(500).send(respUtil.errorResponse(rspObj));
        }
        rspObj.result = {};
        rspObj.result.note = newNote;
        return response.status(200).send(respUtil.successResponse(rspObj));
    });
}

/**
 * We take the node id from params and fetch detail of id from node model, and return note data.
 * @param {Object} request
 * @param {Object} response
 */
function getNoteAPI(request, response) {

    var data = request.body;
    data.noteId = request.params.noteId;

    var rspObj = request.rspObj;

    if (!data.noteId) {
        rspObj.errCode = notesMessage.GET.MISSING_CODE;
        rspObj.errMsg = notesMessage.GET.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    notesMongoModel.findOne({ _id: data.noteId }, function(err, note) {
        if (err && err.name !== "CastError") {
            rspObj.errCode = notesMessage.GET.FAILED_CODE;
            rspObj.errMsg = notesMessage.GET.FAILED_MESSAGE;
            rspObj.responseCode = responseCode.SERVER_ERROR;
            return response.status(500).send(respUtil.errorResponse(rspObj));
        }
        if ((err && err.name === "CastError") || !note) {
            rspObj.errCode = notesMessage.GET.FAILED_CODE;
            rspObj.errMsg = notesMessage.GET.FAILED_MESSAGE;
            rspObj.responseCode = responseCode.RESOURSE_NOT_FOUND;
            return response.status(404).send(respUtil.errorResponse(rspObj));
        }
        rspObj.result = {};
        rspObj.result.note = note;
        return response.status(200).send(respUtil.successResponse(rspObj));
    });
}

/**
 * this function helps to update note, we can update only specific fields.
 * @param {Object} reqData
 * @returns {nm$_notesService.createNoteDataForUpdate.updateNoteData}
 */
function createNoteDataForUpdate(reqData) {
    var updateNoteData = {};
    updateNoteData.lastUpdatedOn = new Date();
    if (reqData.note) {
        updateNoteData.note = reqData.note;
    }
    if (reqData.title) {
        updateNoteData.title = reqData.title;
    }
    if (reqData.tags) {
        updateNoteData.tags = reqData.tags;
    }
    return updateNoteData;
}

/**
 * this function helps to update the content of note
 * @param {Object} request
 * @param {Object} response
 */
function updateNoteAPI(request, response) {

    var data = request.body;
    data.noteId = request.params.noteId;

    var rspObj = request.rspObj;

    if (!data.request || !data.request.note || !data.noteId) {
        rspObj.errCode = notesMessage.UPDATE.MISSING_CODE;
        rspObj.errMsg = notesMessage.UPDATE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    var updateNodeData = createNoteDataForUpdate(data.request.note);

    notesMongoModel.findOneAndUpdate({ _id: data.noteId }, updateNodeData, { new: true }, function(err, note) {
        if (err && err.name !== "CastError") {
            rspObj.errCode = notesMessage.UPDATE.FAILED_CODE;
            rspObj.errMsg = notesMessage.UPDATE.FAILED_MESSAGE;
            rspObj.responseCode = responseCode.SERVER_ERROR;
            return response.status(500).send(respUtil.errorResponse(rspObj));
        }
        if ((err && err.name === "CastError") || !note) {
            rspObj.errCode = notesMessage.UPDATE.FAILED_CODE;
            rspObj.errMsg = notesMessage.UPDATE.FAILED_MESSAGE;
            rspObj.responseCode = responseCode.RESOURSE_NOT_FOUND;
            return response.status(404).send(respUtil.errorResponse(rspObj));
        }
        rspObj.result = {};
        rspObj.result.note = note;
        return response.status(200).send(respUtil.successResponse(rspObj));
    });
}

/**
 * this function helps to create query for search note
 * @param {Object} reqData
 * @returns {Array|createSearchQuery.query|nm$_notesService.createSearchQuery.query}
 */
function createSearchQuery(reqData) {
    var query = [];

    if (reqData.query) {
        var q1 = { $or: [{ note: { $regex: reqData.query, $options: "$i" } }, { title: { $regex: reqData.query, $options: "$i" } }] };
        query.push(q1);
    }
    if (reqData.filters) {
        var filterData = reqData.filters;
        if (filterData.userId) {
            query.push({ userId: filterData.userId });
        }
        if (filterData.courseId) {
            query.push({ courseId: filterData.courseId });
        }
        if (filterData.contentId) {
            query.push({ contentId: filterData.contentId });
        }
        if (filterData.note) {
            query.push({ note: filterData.note });
        }
        if (filterData.title) {
            query.push({ title: filterData.title });
        }
        if (filterData.tags) {
            query.push({ tags: { $all: filterData.tags } });
        }
    }
    return query;
}

/**
 * this function helps to search result
 * @param {Object} request
 * @param {Object} response
 */
function searchNoteAPI(request, response) {

    var data = request.body;
    var rspObj = request.rspObj;

    if (!data.request || !data.request.filters) {
        rspObj.errCode = notesMessage.SEARCH.MISSING_CODE;
        rspObj.errMsg = notesMessage.SEARCH.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    var query = createSearchQuery(data.request);

    var searchNoteModel = notesMongoModel.find({ $and: query });

    if (data.request.limit) {
        searchNoteModel = searchNoteModel.limit(data.request.limit);
    }
    if (data.request.sort_by) {
        searchNoteModel = searchNoteModel.sort(data.request.sort_by);
    }
    if (data.request.offset) {
        searchNoteModel = searchNoteModel.skip(data.request.offset);
    }

    searchNoteModel.exec(function(err, notes) {
        if (err) {
            rspObj.errCode = notesMessage.SEARCH.FAILED_CODE;
            rspObj.errMsg = notesMessage.SEARCH.FAILED_MESSAGE;
            rspObj.responseCode = responseCode.SERVER_ERROR;
            return response.status(500).send(respUtil.errorResponse(rspObj));
        }
        rspObj.result = {};
        rspObj.result.count = notes.length;
        if (notes.length > 0) {
            rspObj.result.note = notes;
        }
        return response.status(200).send(respUtil.successResponse(rspObj));
    });
}

/**
 * this function helps to remove note based on note id.
 * @param {type} request
 * @param {type} response
 */
function deleteNoteAPI(request, response) {
    var data = request.body;
    data.noteId = request.params.noteId;

    var rspObj = request.rspObj;

    if (!data.noteId) {
        rspObj.errCode = notesMessage.DELETE.MISSING_CODE;
        rspObj.errMsg = notesMessage.DELETE.MISSING_MESSAGE;
        rspObj.responseCode = responseCode.CLIENT_ERROR;
        return response.status(400).send(respUtil.errorResponse(rspObj));
    }

    notesMongoModel.findOneAndRemove({ _id: data.noteId }, function(err, note) {
        if (err && err.name !== "CastError") {
            rspObj.errCode = notesMessage.DELETE.FAILED_CODE;
            rspObj.errMsg = notesMessage.DELETE.FAILED_MESSAGE;
            rspObj.responseCode = responseCode.SERVER_ERROR;
            return response.status(500).send(respUtil.errorResponse(rspObj));
        }
        if ((err && err.name === "CastError") || !note) {
            rspObj.errCode = notesMessage.DELETE.FAILED_CODE;
            rspObj.errMsg = notesMessage.DELETE.FAILED_MESSAGE;
            rspObj.responseCode = responseCode.RESOURSE_NOT_FOUND;
            return response.status(404).send(respUtil.errorResponse(rspObj));
        }
        rspObj.result = {};
        return response.status(200).send(respUtil.successResponse(rspObj));
    });
}


module.exports.createNotesAPI = createNotesAPI;
module.exports.getNoteAPI = getNoteAPI;
module.exports.updateNoteAPI = updateNoteAPI;
module.exports.searchNoteAPI = searchNoteAPI;
module.exports.deleteNoteAPI = deleteNoteAPI;
