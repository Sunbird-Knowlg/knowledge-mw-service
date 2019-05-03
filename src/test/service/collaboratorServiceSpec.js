var collaboratorService = require('../../service/collaboratorService.js');
var expect = require('chai').expect;
var sinon = require('sinon');
var collaboratorServiceTestData = require('../fixtures/services/collaboratorServiceTestData').collaboratorServiceTestData;
var contentProvider = require('sb_content_provider_util');
var messageUtils = require('../../../src/service/messageUtil');
var responseCode = messageUtils.RESPONSE_CODE;
var contentMessage = messageUtils.CONTENT;
var httpMocks = require('node-mocks-http');
var mockFunction = function () {
};
var response = httpMocks.createResponse();

describe('Collaborator service.updateCollaborators', function () {
    var mockedGetContentUsingQuery, mockedUpdateContent, mockedSendEmail;

    before(function () {
        mockedGetContentUsingQuery = sinon.stub(contentProvider, "getContentUsingQuery").returns(mockFunction);
        mockedUpdateContent = sinon.stub(contentProvider, "updateContent").returns(mockFunction);
        mockedSendEmail = sinon.stub(contentProvider, "sendEmail").returns(mockFunction);
    });

    after(function () {
        mockedGetContentUsingQuery.restore();
        mockedSendEmail.restore();
        mockedUpdateContent.restore();
    });

    it('should return error as request is not present', function (done) {
        var request = JSON.parse(JSON.stringify(collaboratorServiceTestData.REQUEST));
        request.body.request = null;
        collaboratorService.updateCollaborators(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(contentMessage.COLLABORATORS.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.COLLABORATORS.MISSING_MESSAGE);
        done();
    });

    it('should return error as content is not present', function (done) {
        var request = JSON.parse(JSON.stringify(collaboratorServiceTestData.REQUEST));
        request.body.request.content = null;
        collaboratorService.updateCollaborators(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(contentMessage.COLLABORATORS.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.COLLABORATORS.MISSING_MESSAGE);
        done();
    });

    it('should return error as getting content failed', function (done) {
        mockedGetContentUsingQuery.yields("error", null);
        collaboratorService.updateCollaborators(collaboratorServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal("failed");
        done();
    });

    it('should return error as response code not matched', function (done) {
        mockedGetContentUsingQuery.yields(null, collaboratorServiceTestData.ERROR_RESPONSE);
        collaboratorService.updateCollaborators(collaboratorServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(data.params.status).to.equal("failed");
        expect(data.params.errmsg).to.equal(collaboratorServiceTestData.ERROR_RESPONSE.params.errmsg);
        expect(data.params.err).to.equal(collaboratorServiceTestData.ERROR_RESPONSE.params.err);
        done();
    });

    it('should return error as collaborator is not in draft state', function (done) {
        mockedGetContentUsingQuery.yields(null, collaboratorServiceTestData.SUCCESS_RESPONSE);
        collaboratorService.updateCollaborators(collaboratorServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(403);
        expect(data.responseCode).to.equal(contentMessage.COLLABORATORS.FORBIDDEN);
        expect(data.params.status).to.equal("failed");
        expect(data.params.errmsg).to.equal(contentMessage.COLLABORATORS.FAILED_MESSAGE);
        expect(data.params.err).to.equal(contentMessage.COLLABORATORS.FAILED_CODE);
        done();
    });

    it('should return error as update content status code not matched', function (done) {
        mockedUpdateContent.yields(null, collaboratorServiceTestData.ERROR_RESPONSE);
        mockedGetContentUsingQuery.yields(null, collaboratorServiceTestData.SUCCESS_RESPONSE_DRAFT_STATUS);
        collaboratorService.updateCollaborators(collaboratorServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(data.params.status).to.equal("failed");
        expect(data.params.errmsg).to.equal(collaboratorServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as update content failed from server', function (done) {
        mockedUpdateContent.yields("error", null);
        mockedGetContentUsingQuery.yields(null, collaboratorServiceTestData.SUCCESS_RESPONSE_DRAFT_STATUS);
        collaboratorService.updateCollaborators(collaboratorServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal("failed");
        done();
    });

    it('should not return error', function (done) {
        mockedUpdateContent.yields(null, collaboratorServiceTestData.SUCCESS_RESPONSE);
        mockedGetContentUsingQuery.yields(null, collaboratorServiceTestData.SUCCESS_RESPONSE_DRAFT_STATUS);
        collaboratorService.updateCollaborators(collaboratorServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal("successful");
        done();
    });

});

