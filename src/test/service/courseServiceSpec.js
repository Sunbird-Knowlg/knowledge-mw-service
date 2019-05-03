var courseService = require('../../service/courseService.js');
var expect = require('chai').expect;
var sinon = require('sinon');
var courseServiceTestData = require('../fixtures/services/courseServiceTestData').courseServiceTestData;
var contentProvider = require('sb_content_provider_util');
var messageUtils = require('../../../src/service/messageUtil');
var responseCode = messageUtils.RESPONSE_CODE;
var courseMessage = messageUtils.COURSE;
var httpMocks = require('node-mocks-http');
var mockFunction = function () {
};
var response = httpMocks.createResponse();

describe('Course Service.createCourseAPI', function () {
    var mockedCreateContent;

    before(function () {
        mockedCreateContent = sinon.stub(contentProvider, "createContent").returns(mockFunction);
    });

    after(function () {
        mockedCreateContent.restore();
    });

    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        request.body.request = null;
        courseService.createCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(courseMessage.CREATE.MISSING_CODE);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseMessage.CREATE.MISSING_MESSAGE);
        done();
    });

    it('should return error as course is null', function (done) {
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        request.body.request.course = null;
        courseService.createCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(courseMessage.CREATE.MISSING_CODE);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseMessage.CREATE.MISSING_MESSAGE);
        done();
    });

    it('should return error as description is null', function (done) {
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        request.body.request.course.description = null;
        courseService.createCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(courseMessage.CREATE.MISSING_CODE);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseMessage.CREATE.MISSING_MESSAGE);
        done();
    });

    it('should return error as name is null', function (done) {
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        request.body.request.course.name = null;
        courseService.createCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(courseMessage.CREATE.MISSING_CODE);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseMessage.CREATE.MISSING_MESSAGE);
        done();
    });

    it('should return error as status code not matched for createContent', function (done) {
        mockedCreateContent.yields(null, courseServiceTestData.ERROR_RESPONSE);
        courseService.createCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(data.params.err).to.equal(courseServiceTestData.ERROR_RESPONSE.params.err);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as status code not matched for createContent', function (done) {
        mockedCreateContent.yields("error", null);
        courseService.createCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error as content created success', function (done) {
        mockedCreateContent.yields(null, courseServiceTestData.SUCCESS_RESPONSE);
        courseService.createCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result.course_id).to.equal(courseServiceTestData.SUCCESS_RESPONSE.result.node_id);
        expect(data.result.versionKey).to.equal(courseServiceTestData.SUCCESS_RESPONSE.result.versionKey);
        expect(data.params.status).to.equal('successful');
        done();
    });

});

describe('Course Service.updateCourseAPI', function () {
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
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        request.body.request = null;
        courseService.updateCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(courseMessage.UPDATE.MISSING_CODE);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseMessage.UPDATE.MISSING_MESSAGE);
        done();
    });

    it('should return error as course is null', function (done) {
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        request.body.request.course = null;
        courseService.updateCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(courseMessage.UPDATE.MISSING_CODE);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseMessage.UPDATE.MISSING_MESSAGE);
        done();
    });

    it('should return error as description is null', function (done) {
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        request.body.request.course.versionKey = null;
        courseService.updateCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(courseMessage.UPDATE.MISSING_CODE);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseMessage.UPDATE.MISSING_MESSAGE);
        done();
    });


    it('should return error as status code not matched for updateCourse', function (done) {
        mockedGetContentUsingQuery.yields(null, courseServiceTestData.ERROR_RESPONSE);
        courseService.updateCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(data.params.err).to.equal(courseServiceTestData.ERROR_RESPONSE.params.err);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as status code not matched for createContent', function (done) {
        mockedGetContentUsingQuery.yields("error", null);
        courseService.updateCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as content updated errored', function (done) {
        mockedGetContentUsingQuery.yields(null, courseServiceTestData.UPDATE_SUCCESS_RESPONSE);
        mockedUpdateContent.yields(null, courseServiceTestData.ERROR_RESPONSE);
        courseService.updateCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(data.params.errmsg).to.equal(courseServiceTestData.ERROR_RESPONSE.params.errmsg);
        expect(data.params.err).to.equal(courseServiceTestData.ERROR_RESPONSE.params.err);
        done();
    });

    it('should return error as content updated errored', function (done) {
        mockedGetContentUsingQuery.yields(null, courseServiceTestData.UPDATE_SUCCESS_RESPONSE);
        mockedUpdateContent.yields("error", null);
        courseService.updateCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        done();
    });

    it('should not return error as content updated success', function (done) {
        mockedGetContentUsingQuery.yields(null, courseServiceTestData.UPDATE_SUCCESS_RESPONSE);
        mockedUpdateContent.yields(null, courseServiceTestData.SUCCESS_RESPONSE);
        courseService.updateCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.result.course_id).to.equal(courseServiceTestData.UPDATE_SUCCESS_RESPONSE.result.content.node_id);
        expect(data.result.versionKey).to.equal(courseServiceTestData.UPDATE_SUCCESS_RESPONSE.result.content.versionKey);
        done();
    });

});

describe('Course Service.reviewCourseAPI', function () {
    var mockedReviewContent;

    before(function () {
        mockedReviewContent = sinon.stub(contentProvider, "reviewContent").returns(mockFunction);
    });

    after(function () {
        mockedReviewContent.restore();
    });

    it('should return error as status code not matched for reviewCourseAPI', function (done) {
        mockedReviewContent.yields(null, courseServiceTestData.ERROR_RESPONSE);
        courseService.reviewCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(data.params.err).to.equal(courseServiceTestData.ERROR_RESPONSE.params.err);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as status code not matched for reviewCourseAPI', function (done) {
        mockedReviewContent.yields("error", null);
        courseService.reviewCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as content updated errored', function (done) {
        mockedReviewContent.yields(null, courseServiceTestData.SUCCESS_RESPONSE);
        courseService.reviewCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.result.versionKey).to.equal(courseServiceTestData.SUCCESS_RESPONSE.result.versionKey);
        expect(data.result.course_id).to.equal(courseServiceTestData.SUCCESS_RESPONSE.result.node_id);
        done();
    });

});

describe('Course Service.publishCourseAPI', function () {
    var mockedPublishContent;

    before(function () {
        mockedPublishContent = sinon.stub(contentProvider, "publishContent").returns(mockFunction);
    });

    after(function () {
        mockedPublishContent.restore();
    });

    it('should return error as request is null', function (done) {
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        request.body.request = null;
        courseService.publishCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(courseMessage.PUBLISH.MISSING_CODE);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseMessage.PUBLISH.MISSING_MESSAGE);
        done();
    });

    it('should return error as course is null', function (done) {
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        request.body.request.course = null;
        courseService.publishCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(courseMessage.PUBLISH.MISSING_CODE);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseMessage.PUBLISH.MISSING_MESSAGE);
        done();
    });

    it('should return error as lastPublishedBy is null', function (done) {
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        request.body.request.course.lastPublishedBy = null;
        courseService.publishCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.err).to.equal(courseMessage.PUBLISH.MISSING_CODE);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseMessage.PUBLISH.MISSING_MESSAGE);
        done();
    });

    it('should return error as status code not matched for publishCourseAPI', function (done) {
        mockedPublishContent.yields(null, courseServiceTestData.ERROR_RESPONSE);
        courseService.publishCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(data.params.err).to.equal(courseServiceTestData.ERROR_RESPONSE.params.err);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server errorerd publishCourseAPI', function (done) {
        mockedPublishContent.yields("error", null);
        courseService.publishCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error as published', function (done) {
        mockedPublishContent.yields(null, courseServiceTestData.SUCCESS_RESPONSE);
        courseService.publishCourseAPI(courseServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.result.versionKey).to.equal(courseServiceTestData.SUCCESS_RESPONSE.result.versionKey);
        expect(data.result.course_id).to.equal(courseServiceTestData.SUCCESS_RESPONSE.result.node_id);
        expect(data.result.publishStatus).to.equal(courseServiceTestData.SUCCESS_RESPONSE.result.publishStatus);
        done();
    });

});

describe('Course Service.getMyCourseAPI', function () {
    var mockedCompositeSearch;

    before(function () {
        mockedCompositeSearch = sinon.stub(contentProvider, "compositeSearch").returns(mockFunction);
    });

    after(function () {
        mockedCompositeSearch.restore();
    });

    it('should return error as status code not matched for getMyCourseAPI', function (done) {
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        mockedCompositeSearch.yields(null, courseServiceTestData.ERROR_RESPONSE);
        courseService.getMyCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(data.params.err).to.equal(courseServiceTestData.ERROR_RESPONSE.params.err);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(courseServiceTestData.ERROR_RESPONSE.params.errmsg);
        done();
    });

    it('should return error as server errorerd getMyCourseAPI', function (done) {
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        mockedCompositeSearch.yields("error", null);
        courseService.getMyCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error as getMyCourseAPI success', function (done) {
        var request = JSON.parse(JSON.stringify(courseServiceTestData.REQUEST));
        var successResponse = JSON.parse(JSON.stringify(courseServiceTestData.SUCCESS_RESPONSE_DRAFT_STATUS));
        mockedCompositeSearch.yields(null, successResponse);
        courseService.getMyCourseAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.params.status).to.equal('successful');
        expect(data.result.course.status).to.equal(courseServiceTestData.SUCCESS_RESPONSE_DRAFT_STATUS.result.content.status);
        done();
    });

});


