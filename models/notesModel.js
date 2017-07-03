/*
 * @file: notesModel.js
 * @author: Anuj Gupta
 * @desc: model file for validate user notes.
 */

module.exports.NOTES = {

    CREATE: {
        userId: 'required|string',
        title: 'required|string',
        note: 'required|string'
    }
};
