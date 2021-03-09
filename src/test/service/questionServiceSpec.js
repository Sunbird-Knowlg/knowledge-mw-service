var request = require('request');
var expect = require('chai').expect;
var start = require('./../../app.js').start;
require('chai').use(require("chai-as-promised"));
const nock = require('nock');
var questionServiceTestData = require('../fixtures/services/questionServiceTestData').questionServiceListAPIDATA;
var host = "http://localhost:5000";
var base_url = host + "/v1/question";


describe.only('Question service', function () {

    before((done) => {
        start(done)
    })

    it('should return error when identifer is not provided', function (done) {
        var requestData = questionServiceTestData.CLIENT_ERROR_REQUEST;
        request.post({
            headers: { 'Content-Type': 'application/json' },
            uri: base_url + '/list',
            body: {
                "request": requestData
            },
            json: true
        }, function (error, response, body) {
            console.log(error)
            expect(response.statusCode).eql(400);
            expect(body).to.not.undefined;
            expect(body.responseCode).eql("CLIENT_ERROR");
            expect(body.result).to.not.undefined;;
            done();
        });
    });

    it('should return success with data when proper request is sent', function (done) {
        const identifer = 'do_1131687689003827201864';
        nock('http://assessment-service:9000')
            .persist()
            .get(`/question/v4/read/${identifer}`)
            .query({fields: "name,code,description,mimeType,primaryCategory,additionalCategories,visibility,copyright,license,lockKey,assets,audience,author,owner,attributions,consumerId,contentEncoding,contentDisposition,appIcon,publishCheckList,publishComment,compatibilityLevel,status,prevState,prevStatus,lastStatusChangedOn,keywords,pkgVersion,version,versionKey,language,channel,framework,subject,medium,board,gradeLevel,topic,boardIds,gradeLevelIds,subjectIds,mediumIds,topicsIds,targetFWIds,targetBoardIds,targetGradeLevelIds,targetSubjectIds,targetMediumIds,targetTopicIds,createdOn,createdFor,createdBy,lastUpdatedOn,lastUpdatedBy,lastSubmittedOn,lastSubmittedBy,publisher,lastPublishedOn,lastPublishedBy,publishError,reviewError,body,editorState,answer,solutions,instructions,hints,media,responseDeclaration,interactions,qType,scoringMode,qumlVersion,timeLimit,maxScore,showTimer,showFeedback,showSolutions,interactionTypes,templateId,bloomsLevel,feedback,responseProcessing,templateDeclaration,dailySummaryReportEnabled,allowAnonymousAccess,termsAndConditions,expectedDuration,completionCriteria,collaborators,semanticVersion,schemaVersion"})
            .reply(200, { "id": "api.question.read", "ver": "3.0", "ts": "2021-02-26T09:29:35ZZ", "params": { "resmsgid": "4fe78618-77fe-4061-a4ff-6eb1cc423f5e", "msgid": null, "err": null, "status": "successful", "errmsg": null }, "responseCode": "OK", "result": { "question": { "ownershipType": ["createdBy"], "code": "org.sunbird.ccG6ru", "credentials": { "enabled": "No" }, "channel": "in.ekstep", "language": ["English"], "mimeType": "application/pdf", "idealScreenSize": "normal", "createdOn": "2020-12-09T12:08:54.913+0000", "objectType": "Content", "primaryCategory": "Explanation Content", "contentDisposition": "inline", "lastUpdatedOn": "2020-12-09T12:08:54.913+0000", "contentEncoding": "identity", "contentType": "Resource", "dialcodeRequired": "No", "identifier": "do_1131687689003827201864", "lastStatusChangedOn": "2020-12-09T12:08:54.913+0000", "audience": ["Student"], "os": ["All"], "visibility": "Default", "consumerId": "7411b6bd-89f3-40ec-98d1-229dc64ce77d", "mediaType": "content", "osId": "org.ekstep.quiz.app", "languageCode": ["en"], "version": 2, "versionKey": "1607515734913", "license": "CC BY 4.0", "idealScreenDensity": "hdpi", "framework": "NCF", "createdBy": "874ed8a5-782e-4f6c-8f36-e0288455901e", "compatibilityLevel": 1, "name": "API DOCUMENTATION CONTENT", "status": "Draft" } } })

        var requestData = questionServiceTestData.REQUEST;
        request.post({
            headers: { 'Content-Type': 'application/json' },
            uri: base_url + '/list',
            body: requestData,
            json: true
        }, function (error, response, body) {
            console.log(body)
            expect(response.statusCode).eql(200);
            expect(body).to.not.undefined;
            expect(body.responseCode).eql("OK");
            expect(body.result).to.not.undefined;;
            done();
        });
    });

});
