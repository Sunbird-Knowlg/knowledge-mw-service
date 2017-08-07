/**
 * file: NotesRoute.js
 * author: Anuj Gupta
 * desc: route file for user notes
 */

var notesService = require('../service/notesService');
var requestMiddleware = require('../middlewares/request.middleware');

var BASE_URL = "/v1/note";

module.exports = function(app) {

    app.route(BASE_URL + '/create')
        .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkMongooseConnection, notesService.createNotesAPI);

    app.route(BASE_URL + '/read/:noteId')
        .get(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkMongooseConnection, notesService.getNoteAPI);

    app.route(BASE_URL + '/update/:noteId')
        .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkMongooseConnection, notesService.updateNoteAPI);

    app.route(BASE_URL + '/search/')
        .post(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkMongooseConnection, notesService.searchNoteAPI);

    app.route(BASE_URL + '/delete/:noteId')
        .delete(requestMiddleware.createAndValidateRequestBody, requestMiddleware.checkMongooseConnection, notesService.deleteNoteAPI);

};
