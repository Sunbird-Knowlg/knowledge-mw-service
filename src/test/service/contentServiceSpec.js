var contentService = require('../../service/contentService');
var expect = require('chai').expect;
var sinon = require('sinon');
var contentServiceTestData = require('../fixtures/services/contentServiceTestData').contentServiceTestData;
var contentProvider = require('sb_content_provider_util');
var messageUtils = require('../../../src/service/messageUtil');
var contentMessage = messageUtils.CONTENT;
var compositeMessage = messageUtils.COMPOSITE;
var responseCode = messageUtils.RESPONSE_CODE;
var reqMsg = messageUtils.REQUEST;
var respUtil = require('response_util');
var logger = require('sb_logger_util_v2');
var emailService = require('../../service/emailService');
var validatorUtil = require('sb_req_validator_util');
var httpMocks = require('node-mocks-http');
var CacheManager = require('sb_cache_manager');
var mockFunction = function () {
};
var response = httpMocks.createResponse();

describe('Content service.createContentAPI', function () {
    var mockedCreateContent;

    before(function () {
        mockedCreateContent = sinon.stub(contentProvider, "createContent").returns(mockFunction);
    });

    after(function () {
        mockedCreateContent.restore();
    });


    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        contentService.createContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(contentMessage.CREATE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.CREATE.MISSING_MESSAGE);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as content is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.content = null;
        contentService.createContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(contentMessage.CREATE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.CREATE.MISSING_MESSAGE);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        done();
    });


    it('should return error as status code not matched', function (done) {
        mockedCreateContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.createContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as server errored', function (done) {
        mockedCreateContent.yields("error", null);
        contentService.createContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error', function (done) {
        mockedCreateContent.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        contentService.createContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        var responseData = {
            content_id: contentServiceTestData.SUCCESS_RESPONSE.result.node_id,
            versionKey: contentServiceTestData.SUCCESS_RESPONSE.result.versionKey
        };
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.deep.equal(responseData);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });
});

describe('Content service.updateContentAPI', function () {
    var mockedGetContentUsingQuery, mockedUpdateContent;

    before(function () {
        mockedGetContentUsingQuery = sinon.stub(contentProvider, "getContentUsingQuery").returns(mockFunction);
        mockedUpdateContent = sinon.stub(contentProvider, "updateContent").returns(mockFunction);
    });

    after(function () {
        mockedGetContentUsingQuery.restore();
        mockedUpdateContent.restore();
    });


    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        contentService.updateContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(contentMessage.UPDATE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.UPDATE.MISSING_MESSAGE);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as content is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.content = null;
        contentService.updateContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(contentMessage.UPDATE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.UPDATE.MISSING_MESSAGE);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        done();
    });


    it('should return error as status code not matched', function (done) {
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.updateContentAPI(contentServiceTestData.UPDATE_REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedGetContentUsingQuery.yields("error", null);
        contentService.updateContentAPI(contentServiceTestData.UPDATE_REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as status code not matched while updating', function (done) {
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.UPDATE_SUCCESS_RESPONSE);
        mockedUpdateContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.updateContentAPI(contentServiceTestData.UPDATE_REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as update errored', function (done) {
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.UPDATE_SUCCESS_RESPONSE);
        mockedUpdateContent.yields("error", null);
        contentService.updateContentAPI(contentServiceTestData.UPDATE_REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error as update success', function (done) {
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.UPDATE_SUCCESS_RESPONSE);
        mockedUpdateContent.yields(null, contentServiceTestData.UPDATE_SUCCESS_RESPONSE);
        contentService.updateContentAPI(contentServiceTestData.UPDATE_REQUEST, response);
        var data = response._getData();
        var finalResponse = {
            content_id: contentServiceTestData.UPDATE_SUCCESS_RESPONSE.result.content.node_id,
            versionKey: contentServiceTestData.UPDATE_SUCCESS_RESPONSE.result.content.versionKey
        };
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        expect(data.result.versionKey).to.equal(contentServiceTestData.UPDATE_SUCCESS_RESPONSE.result.content.versionKey);
        done();
    });

});

describe('Content service.reviewContentAPI', function () {
    var mockedReviewContent, mockedReviewContentEmail;

    before(function () {
        mockedReviewContent = sinon.stub(contentProvider, "reviewContent").returns(mockFunction);
        mockedReviewContentEmail = sinon.stub(emailService, "reviewContentEmail").returns(mockFunction);
    });

    after(function () {
        mockedReviewContent.restore();
        mockedReviewContentEmail.restore();
    });


    it('should return error as status code not matched', function (done) {
        mockedReviewContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.reviewContentAPI(contentServiceTestData.UPDATE_REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedReviewContent.yields("error", null);
        contentService.reviewContentAPI(contentServiceTestData.UPDATE_REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });


    it('should not return error as review success', function (done) {
        mockedReviewContent.yields(null, contentServiceTestData.REVIEW_SUCCESS_RESPONSE);
        mockedReviewContentEmail.yields(null, {});
        contentService.reviewContentAPI(contentServiceTestData.UPDATE_REQUEST, response);
        var data = response._getData();
        var finalResponse = {
            content_id: contentServiceTestData.UPDATE_SUCCESS_RESPONSE.result.content.node_id,
            versionKey: contentServiceTestData.UPDATE_SUCCESS_RESPONSE.result.content.versionKey
        };
        expect(data.result).to.deep.equal(finalResponse);
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});

describe('Content service.publishContentAPI', function () {
    var mockedPublishContent, mockedPublishedContentEmail;

    before(function () {
        mockedPublishContent = sinon.stub(contentProvider, "publishContent").returns(mockFunction);
        mockedPublishedContentEmail = sinon.stub(emailService, "publishedContentEmail").returns(mockFunction);
    });

    after(function () {
        mockedPublishContent.restore();
        mockedPublishedContentEmail.restore();
    });

    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        contentService.publishContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(contentMessage.PUBLISH.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.PUBLISH.MISSING_MESSAGE);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.content.lastPublishedBy = null;
        contentService.publishContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(contentMessage.PUBLISH.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.PUBLISH.MISSING_MESSAGE);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedPublishContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.publishContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedPublishContent.yields("error", null);
        contentService.publishContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });


    it('should not return error as publish success', function (done) {
        mockedPublishContent.yields(null, contentServiceTestData.PUBLISH_SUCCESS_RESPONSE);
        mockedPublishedContentEmail.yields(null, {});
        contentService.publishContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        var finalResponse = {
            content_id: contentServiceTestData.PUBLISH_SUCCESS_RESPONSE.result.node_id,
            versionKey: contentServiceTestData.PUBLISH_SUCCESS_RESPONSE.result.versionKey,
            publishStatus: contentServiceTestData.PUBLISH_SUCCESS_RESPONSE.result.publishStatus
        };
        expect(data.result).to.deep.equal(finalResponse);
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });
});

describe('Content service.getMyContentAPI', function () {
    var mockedCompositeSearch;

    before(function () {
        mockedCompositeSearch = sinon.stub(contentProvider, "compositeSearch").returns(mockFunction);
    });

    after(function () {
        mockedCompositeSearch.restore();
    });

    it('should return error as status code not matched', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        mockedCompositeSearch.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.getMyContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });


    it('should return error as server errored', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        mockedCompositeSearch.yields("error", null);
        contentService.getMyContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });


    it('should not return error as publish success', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        mockedCompositeSearch.yields(null, contentServiceTestData.PUBLISH_SUCCESS_RESPONSE);
        contentService.getMyContentAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });
});

describe('Content service.rejectContentAPI', function () {
    var mockedRejectContent, mockedRejectContentEmail;

    before(function () {
        mockedRejectContent = sinon.stub(contentProvider, "rejectContent").returns(mockFunction);
        mockedRejectContentEmail = sinon.stub(emailService, "rejectContentEmail").returns(mockFunction);

    });

    after(function () {
        mockedRejectContent.restore();
        mockedRejectContentEmail.restore();
    });

    it('should return error as content id is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.params.contentId = null;
        mockedRejectContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.rejectContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.REJECT.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.REJECT.MISSING_MESSAGE);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedRejectContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.rejectContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedRejectContent.yields("error", null);
        contentService.rejectContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error as publish success', function (done) {
        mockedRejectContent.yields(null, contentServiceTestData.PUBLISH_SUCCESS_RESPONSE);
        mockedRejectContentEmail.yields(null, {});
        contentService.rejectContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });
});

describe('Content service.flagContentAPI', function () {

    it('should not return error as publish success', function (done) {
        contentService.flagContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});

describe('Content service.acceptFlagContentAPI', function () {
    var mockedAcceptFlagContent, mockedAcceptFlagContentEmail;

    before(function () {
        mockedAcceptFlagContent = sinon.stub(contentProvider, "acceptFlagContent").returns(mockFunction);
        mockedAcceptFlagContentEmail = sinon.stub(emailService, "acceptFlagContentEmail").returns(mockFunction);
    });

    after(function () {
        mockedAcceptFlagContent.restore();
        mockedAcceptFlagContentEmail.restore();
    });

    it('should return error as content id is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.params.contentId = null;
        mockedAcceptFlagContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.acceptFlagContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.ACCEPT_FLAG.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.ACCEPT_FLAG.MISSING_MESSAGE);
        done();
    });

    it('should return error as content id is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        mockedAcceptFlagContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.acceptFlagContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.ACCEPT_FLAG.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.ACCEPT_FLAG.MISSING_MESSAGE);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedAcceptFlagContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.acceptFlagContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedAcceptFlagContent.yields("error", null);
        contentService.acceptFlagContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error as publish success', function (done) {
        mockedAcceptFlagContent.yields(null, contentServiceTestData.PUBLISH_SUCCESS_RESPONSE);
        mockedAcceptFlagContentEmail.yields(null, {});
        contentService.acceptFlagContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.result).to.deep.equal(contentServiceTestData.PUBLISH_SUCCESS_RESPONSE.result);
        expect(data.params.errmsg).to.equal(null);
        done();
    });
});

describe('Content service.rejectFlagContentAPI', function () {
    var mockedRejectFlagContent, mockedRejectFlagContentEmail;

    before(function () {
        mockedRejectFlagContent = sinon.stub(contentProvider, "rejectFlagContent").returns(mockFunction);
        mockedRejectFlagContentEmail = sinon.stub(emailService, "rejectFlagContentEmail").returns(mockFunction);
    });

    after(function () {
        mockedRejectFlagContent.restore();
        mockedRejectFlagContentEmail.restore();
    });

    it('should return error as content id is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.params.contentId = null;
        mockedRejectFlagContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.rejectFlagContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.REJECT_FLAG.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.REJECT_FLAG.MISSING_MESSAGE);
        done();
    });

    it('should return error as content id is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        mockedRejectFlagContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.rejectFlagContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.REJECT_FLAG.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.REJECT_FLAG.MISSING_MESSAGE);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedRejectFlagContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.rejectFlagContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedRejectFlagContent.yields("error", null);
        contentService.rejectFlagContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error as publish success', function (done) {
        mockedRejectFlagContent.yields(null, contentServiceTestData.PUBLISH_SUCCESS_RESPONSE);
        mockedRejectFlagContentEmail.yields(null, {});
        contentService.rejectFlagContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.result).to.deep.equal(contentServiceTestData.PUBLISH_SUCCESS_RESPONSE.result);
        expect(data.params.errmsg).to.equal(null);
        done();
    });
});

describe('Content service.uploadContentUrlAPI', function () {
    var mockedUploadContentUrl;

    before(function () {
        mockedUploadContentUrl = sinon.stub(contentProvider, "uploadContentUrl").returns(mockFunction);
    });

    after(function () {
        mockedUploadContentUrl.restore();
    });

    it('should return error as content id is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.params.contentId = null;
        contentService.uploadContentUrlAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.UPLOAD_URL.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.UPLOAD_URL.MISSING_MESSAGE);
        done();
    });

    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        contentService.uploadContentUrlAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.UPLOAD_URL.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.UPLOAD_URL.MISSING_MESSAGE);
        done();
    });

    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.content = null;
        contentService.uploadContentUrlAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.UPLOAD_URL.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.UPLOAD_URL.MISSING_MESSAGE);
        done();
    });


    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.content.fileName = null;
        contentService.uploadContentUrlAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.UPLOAD_URL.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.UPLOAD_URL.MISSING_MESSAGE);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedUploadContentUrl.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.uploadContentUrlAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedUploadContentUrl.yields("error", null);
        contentService.uploadContentUrlAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error as uploadContentUrlAPI success', function (done) {
        mockedUploadContentUrl.yields(null, contentServiceTestData.PUBLISH_SUCCESS_RESPONSE);
        contentService.uploadContentUrlAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.result).to.deep.equal(contentServiceTestData.PUBLISH_SUCCESS_RESPONSE.result);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});

describe('Content service.unlistedPublishContentAPI', function () {
    var mockedUnlistedPublishContent;

    before(function () {
        mockedUnlistedPublishContent = sinon.stub(contentProvider, "unlistedPublishContent").returns(mockFunction);
    });

    after(function () {
        mockedUnlistedPublishContent.restore();
    });

    it('should return error as content id is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.content = null;
        contentService.unlistedPublishContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.UNLISTED_PUBLISH.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.UNLISTED_PUBLISH.MISSING_MESSAGE);
        done();
    });

    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        contentService.unlistedPublishContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.UNLISTED_PUBLISH.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.UNLISTED_PUBLISH.MISSING_MESSAGE);
        done();
    });

    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.content = null;
        contentService.unlistedPublishContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.UNLISTED_PUBLISH.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.UNLISTED_PUBLISH.MISSING_MESSAGE);
        done();
    });


    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.content.fileName = null;
        contentService.unlistedPublishContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.UNLISTED_PUBLISH.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.UNLISTED_PUBLISH.MISSING_MESSAGE);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedUnlistedPublishContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.unlistedPublishContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedUnlistedPublishContent.yields("error", null);
        contentService.unlistedPublishContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error as PublishContentAPI success', function (done) {
        mockedUnlistedPublishContent.yields(null, contentServiceTestData.PUBLISH_SUCCESS_RESPONSE);
        contentService.unlistedPublishContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        var finalResponse = {
            content_id: contentServiceTestData.PUBLISH_SUCCESS_RESPONSE.result.node_id,
            versionKey: contentServiceTestData.PUBLISH_SUCCESS_RESPONSE.result.versionKey,
            publishStatus: contentServiceTestData.PUBLISH_SUCCESS_RESPONSE.result.publishStatus
        };
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.result).to.deep.equal(finalResponse);
        expect(data.params.errmsg).to.equal(null);
        done();
    });
});

describe('Content service.copyContentAPI', function () {
    var mockedCopyContent;

    before(function () {
        mockedCopyContent = sinon.stub(contentProvider, "copyContent").returns(mockFunction);
    });

    after(function () {
        mockedCopyContent.restore();
    });

    it('should return error as content id is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.params.contentId = null;
        contentService.copyContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.COPY.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.COPY.MISSING_MESSAGE);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedCopyContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.copyContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedCopyContent.yields("error", null);
        contentService.copyContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error as PublishContentAPI success', function (done) {
        mockedCopyContent.yields(null, contentServiceTestData.PUBLISH_SUCCESS_RESPONSE);
        contentService.copyContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.result).to.deep.equal(contentServiceTestData.PUBLISH_SUCCESS_RESPONSE.result);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});

describe('Content service.searchPluginsAPI', function () {
    var mockedPluginsSearch;

    before(function () {
        mockedPluginsSearch = sinon.stub(contentProvider, "pluginsSearch").returns(mockFunction);
    });

    after(function () {
        mockedPluginsSearch.restore();
    });

    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        contentService.searchPluginsAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.SEARCH_PLUGINS.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.SEARCH_PLUGINS.MISSING_MESSAGE);
        done();
    });

    it('should return error as filters is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.filters = null;
        contentService.searchPluginsAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(contentMessage.SEARCH_PLUGINS.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.SEARCH_PLUGINS.MISSING_MESSAGE);
        done();
    });

    it('should return error as status code not matched', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        mockedPluginsSearch.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.searchPluginsAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server errored', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        mockedPluginsSearch.yields("error", null);
        contentService.searchPluginsAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error as PublishContentAPI success', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        mockedPluginsSearch.yields(null, contentServiceTestData.PUBLISH_SUCCESS_RESPONSE);
        contentService.searchPluginsAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.result).to.deep.equal(contentServiceTestData.PUBLISH_SUCCESS_RESPONSE.result);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});

describe('Content service.searchAPI', function () {
    var mockedCompositeSearch, mockedSetCacheManager, mockedGetCacheManager, mockedGetFrameworkById;

    before(function () {
        mockedCompositeSearch = sinon.stub(contentProvider, "compositeSearch").returns(mockFunction);
        mockedGetFrameworkById = sinon.stub(contentProvider, "getFrameworkById").returns(mockFunction);
        mockedGetCacheManager = sinon.stub(CacheManager.prototype, "get").returns(mockFunction);
        mockedSetCacheManager = sinon.stub(CacheManager.prototype, "set").returns(mockFunction);
    });

    after(function () {
        mockedCompositeSearch.restore();
        mockedGetFrameworkById.restore();
        mockedGetCacheManager.restore();
        mockedSetCacheManager.restore();
    });

    it('should return error request in null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        mockedCompositeSearch.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.searchAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentMessage.SEARCH.MISSING_MESSAGE);
        expect(data.params.err).to.equal(contentMessage.SEARCH.MISSING_CODE);
        done();
    });


    it('should return error as filters are null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.filters = null;
        mockedCompositeSearch.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.searchAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentMessage.SEARCH.MISSING_MESSAGE);
        expect(data.params.err).to.equal(contentMessage.SEARCH.MISSING_CODE);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedCompositeSearch.yields("error", null);
        contentService.searchAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal('failed');
        expect(data.result).to.deep.equal({});
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedCompositeSearch.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.searchAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should not return error', function (done) {
        mockedCompositeSearch.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        contentService.searchAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(contentServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

    it('should not return error and fetch framework details', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.query.framework = {};
        mockedGetCacheManager.yields(null, {"mockdata": "mockdata"});
        mockedCompositeSearch.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        contentService.searchAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(contentServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

    it('should fetch content even if cache manager throws error', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.query.framework = {};
        mockedGetCacheManager.yields({}, null);
        mockedCompositeSearch.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        mockedGetFrameworkById.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.searchAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(contentServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

    it('should fetch content even and set value in cache manager errored', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.query.framework = {};
        mockedGetCacheManager.yields({}, null);
        mockedSetCacheManager.yields("error", null);
        mockedCompositeSearch.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        mockedGetFrameworkById.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        contentService.searchAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(contentServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

    it('should fetch content even and set value in cache manager success', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.query.framework = {};
        mockedGetCacheManager.yields({}, null);
        mockedSetCacheManager.yields(null, {"success": "success"});
        mockedCompositeSearch.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        mockedGetFrameworkById.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        contentService.searchAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(contentServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });
});

describe('Content service.validateContentLock', function () {
    var mockedGetContentUsingQuery;

    before(function () {
        mockedGetContentUsingQuery = sinon.stub(contentProvider, "getContentUsingQuery").returns(mockFunction);
    });

    after(function () {
        mockedGetContentUsingQuery.restore();
    });

    it('should return error as status code not matched', function (done) {
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.validateContentLock(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(500);
        expect(data.result.validation).to.equal(false);
        expect(data.result.message).to.equal("mock error");
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as server errored', function (done) {
        mockedGetContentUsingQuery.yields("error", null);
        contentService.validateContentLock(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.result.validation).to.equal(false);
        expect(data.result.message).to.equal("Unable to fetch content details");
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error as validated content lock success', function (done) {
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.GET_CONTENT_SUCCESSS_RESPONSE);
        contentService.validateContentLock(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        //expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.result.validation).to.equal(false);
        expect(data.result.message).to.equal("The operation cannot be completed as content is not in draft state");
        expect(data.params.errmsg).to.equal(null);
        done();
    });

    it('should not return error as draft status attened', function (done) {
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.GET_CONTENT_VALIDATED_DRAFT_RESPONSE);
        contentService.validateContentLock(contentServiceTestData.DRAFT_REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.result.validation).to.equal(true);
        expect(data.result.message).to.equal("Content successfully validated");
        expect(data.params.errmsg).to.equal(null);
        done();
    });
    it('should not return error as draft status attened', function (done) {
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.GET_CONTENT_SUCCESS_DRAFT_RESPONSE);
        contentService.validateContentLock(contentServiceTestData.DRAFT_REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.result.validation).to.equal(false);
        expect(data.result.message).to.equal("You are not authorized");
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});

describe('Content service.getContentAPI', function () {
    var mockedGetContentUsingQuery, mockedCompositeSearch;

    before(function () {
        mockedGetContentUsingQuery = sinon.stub(contentProvider, "getContentUsingQuery").returns(mockFunction);
        mockedCompositeSearch = sinon.stub(contentProvider, "compositeSearch").returns(mockFunction);
    });

    after(function () {
        mockedGetContentUsingQuery.restore();
        mockedCompositeSearch.restore();
    });

    it('should return error as status code not matched', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.params.contentId = null;
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.getContentAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentMessage.GET.MISSING_MESSAGE);
        expect(data.params.err).to.equal(contentMessage.GET.MISSING_CODE);
        done();
    });

    it('should return error as server errored', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        mockedGetContentUsingQuery.yields("error", null);
        contentService.getContentAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal('failed');
        expect(data.result).to.deep.equal({});
        done();
    });

    it('should return error as status code not matched', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.getContentAPI(request, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as validated content lock success', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        contentService.getContentAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(contentServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

    it('should return error as CompositeSearch failed', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.SUCCESS_RESPONSE_GET_CONTENT_API);
        mockedCompositeSearch.yields("error", null);
        contentService.getContentAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as CompositeSearch error code not matched', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.SUCCESS_RESPONSE_GET_CONTENT_API);
        mockedCompositeSearch.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.getContentAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should not return error', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        mockedGetContentUsingQuery.yields(null, contentServiceTestData.SUCCESS_RESPONSE_GET_CONTENT_API);
        mockedCompositeSearch.yields(null, contentServiceTestData.SUCCESS_RESPONSE_GET_CONTENT_API);
        contentService.getContentAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.result).to.deep.equal(contentServiceTestData.SUCCESS_RESPONSE_GET_CONTENT_API.result);
        done();
    });


});

describe('Content service.searchContentAPI', function () {
    var mockedCompositeSearch, mockedSetCacheManager, mockedGetCacheManager, mockedGetFrameworkById;

    before(function () {
        mockedCompositeSearch = sinon.stub(contentProvider, "compositeSearch").returns(mockFunction);
        mockedGetFrameworkById = sinon.stub(contentProvider, "getFrameworkById").returns(mockFunction);
        mockedGetCacheManager = sinon.stub(CacheManager.prototype, "get").returns(mockFunction);
        mockedSetCacheManager = sinon.stub(CacheManager.prototype, "set").returns(mockFunction);
    });

    after(function () {
        mockedCompositeSearch.restore();
        mockedGetFrameworkById.restore();
        mockedGetCacheManager.restore();
        mockedSetCacheManager.restore();
    });

    it('should return error request in null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        mockedCompositeSearch.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.searchContentAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentMessage.SEARCH.MISSING_MESSAGE);
        expect(data.params.err).to.equal(contentMessage.SEARCH.MISSING_CODE);
        done();
    });


    it('should return error as filters are null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.filters = null;
        mockedCompositeSearch.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.searchContentAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentMessage.SEARCH.MISSING_MESSAGE);
        expect(data.params.err).to.equal(contentMessage.SEARCH.MISSING_CODE);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedCompositeSearch.yields("error", null);
        contentService.searchContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal('failed');
        expect(data.result).to.deep.equal({});
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedCompositeSearch.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.searchContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should not return error', function (done) {
        mockedCompositeSearch.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        contentService.searchContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(contentServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

    it('should not return error and fetch framework details', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.query.framework = {};
        mockedGetCacheManager.yields(null, {"mockdata": "mockdata"});
        mockedCompositeSearch.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        contentService.searchContentAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(contentServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

    it('should fetch content even if cache manager throws error', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.query.framework = {};
        mockedGetCacheManager.yields({}, null);
        mockedCompositeSearch.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        mockedGetFrameworkById.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.searchContentAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(contentServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

    it('should fetch content even and set value in cache manager errored', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.query.framework = {};
        mockedGetCacheManager.yields({}, null);
        mockedSetCacheManager.yields("error", null);
        mockedCompositeSearch.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        mockedGetFrameworkById.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        contentService.searchContentAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(contentServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

    it('should fetch content even and set value in cache manager success', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.query.framework = {};
        mockedGetCacheManager.yields({}, null);
        mockedSetCacheManager.yields(null, {"success": "success"});
        mockedCompositeSearch.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        mockedGetFrameworkById.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        contentService.searchContentAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(contentServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});

describe('Content service.retireContentAPI', function () {
    var mockedSearchContent;

    before(function () {
        mockedSearchContent = sinon.stub(contentProvider, "searchContent").returns(mockFunction);
    });

    after(function () {
        mockedSearchContent.restore();
    });

    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        contentService.retireContentAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.params.err).to.equal(contentMessage.RETIRE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.RETIRE.MISSING_MESSAGE);
        done();
    });

    it('should return error as contentIds is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.contentIds = null;
        contentService.retireContentAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.params.err).to.equal(contentMessage.RETIRE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.RETIRE.MISSING_MESSAGE);
        done();
    });

    it('should return error as error in searching content', function (done) {
        mockedSearchContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.retireContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(500);
        expect(data.result).to.deep.equal({});
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as user unauthorized', function (done) {
        mockedSearchContent.yields(null, contentServiceTestData.SUCCESS_RESPONSE);
        contentService.retireContentAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(401);
        expect(data.result).to.deep.equal({});
        expect(data.params.errmsg).to.equal(reqMsg.TOKEN.INVALID_MESSAGE);
        expect(data.params.err).to.equal(reqMsg.TOKEN.INVALID_CODE);
        expect(data.responseCode).to.equal(responseCode.UNAUTHORIZED_ACCESS);
        done();
    });

});

describe('Content service.assignBadge', function () {
    var mockedGetContent;

    before(function () {
        mockedGetContent = sinon.stub(contentProvider, "getContent").returns(mockFunction);
    });

    after(function () {
        mockedGetContent.restore();
    });

    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        contentService.assignBadgeAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.params.err).to.equal(contentMessage.ASSIGN_BADGE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.ASSIGN_BADGE.MISSING_MESSAGE);
        done();
    });

    it('should return error as content is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.content = null;
        contentService.assignBadgeAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.params.err).to.equal(contentMessage.ASSIGN_BADGE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.ASSIGN_BADGE.MISSING_MESSAGE);
        done();
    });

    it('should return error as badgeAssertion is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.content.badgeAssertion = null;
        contentService.assignBadgeAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.params.err).to.equal(contentMessage.ASSIGN_BADGE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.ASSIGN_BADGE.MISSING_MESSAGE);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedGetContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.assignBadgeAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server gave error', function (done) {
        mockedGetContent.yields("error", null);
        contentService.assignBadgeAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal('failed');
        done();
    });

});

describe('Content service.revokeBadgeAPI', function () {
    var mockedGetContent;

    before(function () {
        mockedGetContent = sinon.stub(contentProvider, "getContent").returns(mockFunction);
    });

    after(function () {
        mockedGetContent.restore();
    });

    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request = null;
        contentService.revokeBadgeAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.params.err).to.equal(contentMessage.REVOKE_BADGE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.REVOKE_BADGE.MISSING_MESSAGE);
        done();
    });

    it('should return error as content is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.content = null;
        contentService.revokeBadgeAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.params.err).to.equal(contentMessage.REVOKE_BADGE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.REVOKE_BADGE.MISSING_MESSAGE);
        done();
    });

    it('should return error as badgeAssertion is null', function (done) {
        var request = JSON.parse(JSON.stringify(contentServiceTestData.REQUEST));
        request.body.request.content.badgeAssertion = null;
        contentService.revokeBadgeAPI(request, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(400);
        expect(data.params.err).to.equal(contentMessage.REVOKE_BADGE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(contentMessage.REVOKE_BADGE.MISSING_MESSAGE);
        done();
    });

    it('should return error as server errored', function (done) {
        mockedGetContent.yields(null, contentServiceTestData.ERROR_RESPONSE);
        contentService.revokeBadgeAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(data.params.errmsg).to.equal(contentServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server gave error', function (done) {
        mockedGetContent.yields("error", null);
        contentService.revokeBadgeAPI(contentServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response._getStatusCode()).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal('failed');
        done();
    });

});
