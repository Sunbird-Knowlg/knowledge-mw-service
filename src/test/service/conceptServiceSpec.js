var conceptService = require('../../service/conceptService');
var expect = require('chai').expect;
var sinon = require('sinon');
var conceptServiceTestData = require('../fixtures/services/conceptServiceTestData').conceptServiceTestData;
var contentProvider = require('sb_content_provider_util');
var messageUtils = require('../../../src/service/messageUtil');
var responseCode = messageUtils.RESPONSE_CODE;
var domainMessage = messageUtils.DOMAIN
var logger = require('sb_logger_util_v2')


var httpMocks = require('node-mocks-http');
var mockFunction = function () {
};
var errorResponse = conceptServiceTestData.ERROR_RESPONSE;
var successResponse = conceptServiceTestData.SUCCESS_RESPONSE;

var response = httpMocks.createResponse();

describe('Concept service.getDomainsAPI', function () {
    var mockedGetChannelValueById;

    before(function () {
        mockedGetDomains = sinon.stub(contentProvider, "getDomains").returns(mockFunction);
    });

    after(function () {
        mockedGetDomains.restore();
    });


    it('should return error as error from server', function (done) {
        mockedGetDomains.yields("error", null);
        conceptService.getDomainsAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedGetDomains.yields(null, errorResponse);
        conceptService.getDomainsAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error status code', function (done) {
        mockedGetDomains.yields(null, successResponse);
        conceptService.getDomainsAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(successResponse.result);
        expect(data.result).to.equal(conceptServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});

describe('Concept service.getDomainByIDAPI', function () {
    var mockedGetDomainById;

    before(function () {
        mockedGetDomainById = sinon.stub(contentProvider, "getDomainById").returns(mockFunction);
    });

    after(function () {
        mockedGetDomainById.restore();
    });

    it('should return error as channel ID is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.domainId = null;
        conceptService.getDomainByIDAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });
    it('should return error as error from server', function (done) {
        mockedGetDomainById.yields("error", null);
        conceptService.getDomainByIDAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedGetDomainById.yields(null, errorResponse);
        conceptService.getDomainByIDAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return ', function (done) {
        mockedGetDomainById.yields(null, successResponse);
        conceptService.getDomainByIDAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(conceptServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        expect(data.result).to.equal(successResponse.result);
        done();
    });

});

describe('Concept service.getObjectById', function () {
    var mockedGetObjectById;

    before(function () {
        mockedGetObjectById = sinon.stub(contentProvider, "getObjectById").returns(mockFunction);
    });

    after(function () {
        mockedGetObjectById.restore();
    });

    it('should return error as domain ID is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.domainId = null;
        conceptService.getObjectTypeByIDAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as object type is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.objectType = null;
        conceptService.getObjectTypeByIDAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as object type is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.objectId = null;
        conceptService.getObjectTypeByIDAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as error from server', function (done) {
        mockedGetObjectById.yields("error", null);
        conceptService.getObjectTypeByIDAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedGetObjectById.yields(null, errorResponse);
        conceptService.getObjectTypeByIDAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return ', function (done) {
        mockedGetObjectById.yields(null, successResponse);
        conceptService.getObjectTypeByIDAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(conceptServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        expect(data.result).to.equal(successResponse.result);
        done();
    });

});

describe('Concept service.getObjectTypesAPI', function () {
    var mockedGetObjects;

    before(function () {
        mockedGetObjects = sinon.stub(contentProvider, "getObjects").returns(mockFunction);
    });

    after(function () {
        mockedGetObjects.restore();
    });

    it('should return error as domain ID is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.domainId = null;
        conceptService.getObjectTypesAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as object type is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.objectType = null;
        conceptService.getObjectTypesAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as error from server', function (done) {
        mockedGetObjects.yields("error", null);
        conceptService.getObjectTypesAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedGetObjects.yields(null, errorResponse);
        conceptService.getObjectTypesAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return ', function (done) {
        mockedGetObjects.yields(null, successResponse);
        conceptService.getObjectTypesAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(conceptServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        expect(data.result).to.equal(successResponse.result);
        done();
    });

});

describe('Concept service.getConceptByIdAPI', function () {
    var mockedGetConceptById;

    before(function () {
        mockedGetConceptById = sinon.stub(contentProvider, "getConceptById").returns(mockFunction);
    });

    after(function () {
        mockedGetConceptById.restore();
    });

    it('should return error as domain ID is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.conceptId = null;
        conceptService.getConceptByIdAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedGetConceptById.yields(null, errorResponse);
        conceptService.getConceptByIdAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return ', function (done) {
        mockedGetConceptById.yields(null, successResponse);
        conceptService.getConceptByIdAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(successResponse.result);
        expect(data.result).to.equal(conceptServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});

describe('Concept service.searchObjectTypeAPI', function () {
    var mockedSearchObjectsType;

    before(function () {
        mockedSearchObjectsType = sinon.stub(contentProvider, "searchObjectsType").returns(mockFunction);
    });

    after(function () {
        mockedSearchObjectsType.restore();
    });

    it('should return error as domain ID is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.domainId = null;
        conceptService.searchObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(domainMessage.SEARCH_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.SEARCH_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as objectType is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.objectType = null;
        conceptService.searchObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(domainMessage.SEARCH_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.SEARCH_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as request is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.body.request = null;
        conceptService.searchObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(domainMessage.SEARCH_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.SEARCH_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as search is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.body.request.search = null;
        conceptService.searchObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(domainMessage.SEARCH_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.SEARCH_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedSearchObjectsType.yields(null, errorResponse);
        conceptService.searchObjectTypeAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return ', function (done) {
        mockedSearchObjectsType.yields(null, successResponse);
        conceptService.searchObjectTypeAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(successResponse.result);
        expect(data.result).to.equal(conceptServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});


describe('Concept service.createObjectTypeAPI', function () {
    var mockedCreateObjectType;

    before(function () {
        mockedCreateObjectType = sinon.stub(contentProvider, "createObjectType").returns(mockFunction);
    });

    after(function () {
        mockedCreateObjectType.restore();
    });

    it('should return error as domain ID is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.domainId = null;
        conceptService.createObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(domainMessage.CREATE_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.CREATE_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as objectType is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.objectType = null;
        conceptService.createObjectTypeAPI(request, response);
        var data = response._getData();
        expect(data.params.err).to.equal(domainMessage.CREATE_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.CREATE_OBJECT_TYPE.MISSING_MESSAGE);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as request is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.body.request = null;
        conceptService.createObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(domainMessage.CREATE_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.CREATE_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as search is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.body.request.object = null;
        conceptService.createObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(domainMessage.CREATE_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.CREATE_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });
    it('should return error as thrown error', function (done) {
        mockedCreateObjectType.yields("error", null);
        conceptService.createObjectTypeAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedCreateObjectType.yields(null, errorResponse);
        conceptService.createObjectTypeAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return error', function (done) {
        mockedCreateObjectType.yields(null, successResponse);
        conceptService.createObjectTypeAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(conceptServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        expect(data.result).to.equal(successResponse.result);
        done();
    });

});


describe('Concept service.updateObjectTypeAPI', function () {
    var mockedUpdateObjectType;

    before(function () {
        mockedUpdateObjectType = sinon.stub(contentProvider, "updateObjectType").returns(mockFunction);
    });

    after(function () {
        mockedUpdateObjectType.restore();
    });

    it('should return error as domain ID is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.domainId = null;
        conceptService.updateObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(domainMessage.UPDATE_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.UPDATE_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as objectType is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.objectType = null;
        conceptService.updateObjectTypeAPI(request, response);
        var data = response._getData();
        expect(data.params.err).to.equal(domainMessage.UPDATE_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.UPDATE_OBJECT_TYPE.MISSING_MESSAGE);
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as request is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.body.request = null;
        conceptService.updateObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(domainMessage.UPDATE_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.UPDATE_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as search is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.body.request.object = null;
        conceptService.updateObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(domainMessage.UPDATE_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.UPDATE_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });
    it('should return error as thrown error', function (done) {
        mockedUpdateObjectType.yields("error", null);
        conceptService.updateObjectTypeAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as status code not matched', function (done) {
        mockedUpdateObjectType.yields(null, errorResponse);
        conceptService.updateObjectTypeAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should not return ', function (done) {
        mockedUpdateObjectType.yields(null, successResponse);
        conceptService.updateObjectTypeAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(successResponse.result);
        expect(data.result).to.equal(conceptServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});


describe('Concept service.retireObjectTypeAPI', function () {
    var mockedRetireObjectType;

    before(function () {
        mockedRetireObjectType = sinon.stub(contentProvider, "retireObjectType").returns(mockFunction);
    });

    after(function () {
        mockedRetireObjectType.restore();
    });

    it('should return error as domain ID is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.domainId = null;
        conceptService.retireObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.status).to.equal('failed');
        expect(data.params.err).to.equal(domainMessage.RETIRE_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.RETIRE_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as object type is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.objectType = null;
        conceptService.retireObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.err).to.equal(domainMessage.RETIRE_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.status).to.equal('failed');
        expect(data.params.errmsg).to.equal(domainMessage.RETIRE_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        done();
    });

    it('should return error as object type is not present', function (done) {
        var request = JSON.parse(JSON.stringify(conceptServiceTestData.REQUEST));
        request.params.objectId = null;
        conceptService.retireObjectTypeAPI(request, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(400);
        expect(data.params.err).to.equal(domainMessage.RETIRE_OBJECT_TYPE.MISSING_CODE);
        expect(data.params.errmsg).to.equal(domainMessage.RETIRE_OBJECT_TYPE.MISSING_MESSAGE);
        expect(data.responseCode).to.equal(responseCode.CLIENT_ERROR);
        expect(data.params.status).to.equal('failed');
        done();
    });

    it('should return error as server error', function (done) {
        mockedRetireObjectType.yields("error", null);
        conceptService.retireObjectTypeAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.params.status).to.equal('failed');
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        done();
    });

    it('should return error as response code not matched', function (done) {
        mockedRetireObjectType.yields(null, conceptServiceTestData.ERROR_RESPONSE);
        conceptService.retireObjectTypeAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        done();
    });

    it('should not return error', function (done) {
        mockedRetireObjectType.yields(null, conceptServiceTestData.SUCCESS_RESPONSE);
        conceptService.retireObjectTypeAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(conceptServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        done();
    });

});

describe('Concept service.listTermsAPI', function () {
    var mockedListTerms;

    before(function () {
        mockedListTerms = sinon.stub(contentProvider, "listTerms").returns(mockFunction);
    });

    after(function () {
        mockedListTerms.restore();
    });

    it('should return error as server error', function (done) {
        mockedListTerms.yields("error", null);
        conceptService.listTermsAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.params.status).to.equal('failed');
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        done();
    });

    it('should return error as response code not matched', function (done) {
        mockedListTerms.yields(null, conceptServiceTestData.ERROR_RESPONSE);
        conceptService.listTermsAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        done();
    });

    it('should not return error', function (done) {
        mockedListTerms.yields(null, conceptServiceTestData.SUCCESS_RESPONSE);
        conceptService.listTermsAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(conceptServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});

describe('Concept service.listResourceBundlesAPI', function () {
    var mockedListResourceBundles;

    before(function () {
        mockedListResourceBundles = sinon.stub(contentProvider, "listResourceBundles").returns(mockFunction);
    });

    after(function () {
        mockedListResourceBundles.restore();
    });

    it('should return error as server error', function (done) {
        mockedListResourceBundles.yields("error", null);
        conceptService.listResourceBundlesAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.params.status).to.equal('failed');
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        done();
    });

    it('should return error as response code not matched', function (done) {
        mockedListResourceBundles.yields(null, conceptServiceTestData.ERROR_RESPONSE);
        conceptService.listResourceBundlesAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        done();
    });

    it('should not return error', function (done) {
        mockedListResourceBundles.yields(null, conceptServiceTestData.SUCCESS_RESPONSE);
        conceptService.listResourceBundlesAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(conceptServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});


describe('Concept service.listOrdinalsAPI', function () {
    var mockedListOrdinals;

    before(function () {
        mockedListOrdinals = sinon.stub(contentProvider, "listOrdinals").returns(mockFunction);
    });

    after(function () {
        mockedListOrdinals.restore();
    });

    it('should return error as server error', function (done) {
        mockedListOrdinals.yields("error", null);
        conceptService.listOrdinalsAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(data.params.status).to.equal('failed');
        expect(response.statusCode).to.equal(500);
        expect(data.responseCode).to.equal(responseCode.SERVER_ERROR);
        done();
    });

    it('should return error as response code not matched', function (done) {
        mockedListOrdinals.yields(null, conceptServiceTestData.ERROR_RESPONSE);
        conceptService.listOrdinalsAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(500);
        expect(data.params.status).to.equal('failed');
        expect(data.responseCode).to.equal(responseCode.RESOURCE_NOT_FOUND);
        done();
    });

    it('should not return error', function (done) {
        mockedListOrdinals.yields(null, conceptServiceTestData.SUCCESS_RESPONSE);
        conceptService.listOrdinalsAPI(conceptServiceTestData.REQUEST, response);
        var data = response._getData();
        expect(response.statusCode).to.equal(200);
        expect(data.result).to.equal(conceptServiceTestData.SUCCESS_RESPONSE.result);
        expect(data.params.status).to.equal('successful');
        expect(data.params.err).to.equal(null);
        expect(data.params.errmsg).to.equal(null);
        done();
    });

});
