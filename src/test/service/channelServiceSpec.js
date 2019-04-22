var channelService = require('../../service/channelService.js');
var expect = require('chai').expect;
var sinon = require('sinon');
var channelServiceTestData = require('../fixtures/services/channelServiceTestData').channelServiceTestData;
var ekStepUtil = require('sb_content_provider_util');
var messageUtils = require('../../../src/service/messageUtil');
var responseCode = messageUtils.RESPONSE_CODE;
var httpMocks = require('node-mocks-http');
var mockFunction = function () {
};
var errorResponse = channelServiceTestData.ERROR_RESPONSE;
var successResponse = channelServiceTestData.SUCCESS_RESPONSE;

var response = httpMocks.createResponse();

describe('Channel service.getChannelValuesById', function () {
    var mockedGetChannelValueById;

    before(function () {
        mockedGetChannelValueById = sinon.stub(ekStepUtil, "getChannelValuesById").returns(mockFunction);
    });

    after(function () {
        mockedGetChannelValueById.restore();
    });

    it('should return error as channel ID is not present', function (done) {
        var request = JSON.parse(JSON.stringify(channelServiceTestData.REQUEST));
        request.params.channelId = null;
        channelService.getChannelValuesById(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as error from server', function (done) {
        mockedGetChannelValueById.yields("error", null);
        channelService.getChannelValuesById(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedGetChannelValueById.yields(null, errorResponse);
        channelService.getChannelValuesById(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        done();
    });

    it('should not return ', function (done) {
        mockedGetChannelValueById.yields(null, successResponse);
        channelService.getChannelValuesById(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(successResponse.result);
        done();
    });

});

describe('Channel service.ChannelList', function () {
    var mockedChannelList;
    before(function () {
        mockedChannelList = sinon.stub(ekStepUtil, "ChannelList").returns(mockFunction);
    });

    after(function () {
        mockedChannelList.restore();
    });

    it('should return error as channel ID is not present', function (done) {
        var request = JSON.parse(JSON.stringify(channelServiceTestData.REQUEST));
        request.body = null;
        channelService.ChannelList(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as error from server', function (done) {
        mockedChannelList.yields("error", null);
        channelService.ChannelList(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedChannelList.yields(null, errorResponse);
        channelService.ChannelList(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        done();
    });

    it('should not return ', function (done) {
        mockedChannelList.yields(null, successResponse);
        channelService.ChannelList(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(successResponse.result);
        done();
    });

});

describe('Channel service.ChannelCreate', function () {
    var mockedChannelCreate;
    before(function () {
        mockedChannelCreate = sinon.stub(ekStepUtil, "ChannelCreate").returns(mockFunction);
    });

    after(function () {
        mockedChannelCreate.restore();
    });

    it('should return error as channel ID is not present', function (done) {
        var request = JSON.parse(JSON.stringify(channelServiceTestData.REQUEST));
        request.body = null;
        channelService.ChannelCreate(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as error from server', function (done) {
        mockedChannelCreate.yields("error", null);
        channelService.ChannelCreate(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedChannelCreate.yields(null, errorResponse);
        channelService.ChannelCreate(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        done();
    });

    it('should not return ', function (done) {
        mockedChannelCreate.yields(null, successResponse);
        channelService.ChannelCreate(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(successResponse.result);
        done();
    });

});

describe('Channel service.ChannelUpdate', function () {
    var mockedChannelUpdate;

    before(function () {
        mockedChannelUpdate = sinon.stub(ekStepUtil, "ChannelUpdate").returns(mockFunction);
    });

    after(function () {
        mockedChannelUpdate.restore();
    });

    it('should return error as body is not present', function (done) {
        var request = JSON.parse(JSON.stringify(channelServiceTestData.REQUEST));
        request.body = null;
        channelService.ChannelUpdate(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as error from server', function (done) {
        mockedChannelUpdate.yields("error", null);
        channelService.ChannelUpdate(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedChannelUpdate.yields(null, errorResponse);
        channelService.ChannelUpdate(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        done();
    });

    it('should not return ', function (done) {
        mockedChannelUpdate.yields(null, successResponse);
        channelService.ChannelUpdate(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(successResponse.result);
        done();
    });

});

describe('Channel service.ChannelSearch', function () {
    var mockedChannelSearch;
    before(function () {
        mockedChannelSearch = sinon.stub(ekStepUtil, "ChannelSearch").returns(mockFunction);
    });

    after(function () {
        mockedChannelSearch.restore();
    });

    it('should return error as body is not present', function (done) {
        var request = JSON.parse(JSON.stringify(channelServiceTestData.REQUEST));
        request.body = null;
        channelService.ChannelSearch(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as error from server', function (done) {
        mockedChannelSearch.yields("error", null);
        channelService.ChannelSearch(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedChannelSearch.yields(null, errorResponse);
        channelService.ChannelSearch(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        done();
    });

    it('should not return error ', function (done) {
        mockedChannelSearch.yields(null, successResponse);
        channelService.ChannelSearch(channelServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(successResponse.result);
        done();
    });

});
