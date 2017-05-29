/**
 * file: NotesRoute.js
 * author: Anuj Gupta
 * desc: route file for user notes
 */

var notesService = require('../service/notesService');
var requestMiddleware = require('../middlewares/request.middleware');

var BASE_URL_V1 = "/api/sb/v1/notes";

module.exports = function(app) {

    app.route(BASE_URL_V1 + '/create')
        .post(requestMiddleware.createAndValidateRequestBody, notesService.createNotesAPI);

    app.route(BASE_URL_V1 + '/get/:noteId')
        .get(requestMiddleware.createAndValidateRequestBody, notesService.getNoteAPI);

    app.route(BASE_URL_V1 + '/update/:noteId')
        .patch(requestMiddleware.createAndValidateRequestBody, notesService.updateNoteAPI);

    app.route(BASE_URL_V1 + '/search/')
        .post(requestMiddleware.createAndValidateRequestBody, notesService.searchNoteAPI);

    app.route(BASE_URL_V1 + '/delete/:noteId')
        .delete(requestMiddleware.createAndValidateRequestBody, notesService.deleteNoteAPI);

};
