/*
 * @file: notesModel.js
 * @author: Anuj Gupta
 * @desc: model file for user notes.
 */

var mongoose = require('mongoose');

var noteSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true
    },
    courseId: {
        type: String,
        required: false
    },
    contentId: {
        type: String,
        required: false
    },
    title: {
        type: String,
        required: true
    },
    note: {
        type: String,
        required: true
    },
    tags: [],
    createdOn: {
        type: Date,
        default: Date.now
    },
    lastUpdatedOn: {
        type: Date,
        default: Date.now
    }
});

var noteModel = mongoose.model('notes', noteSchema);

if (!noteSchema.options.toObject)
    noteSchema.options.toObject = {};

noteSchema.options.toJSON = {
    transform: function(doc, note, options) {
        note.identifier = note._id;
        delete note._id;
        delete note.__v;
        return note;
    }
};

module.exports = noteModel;
