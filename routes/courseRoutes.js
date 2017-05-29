/**
 * file: course-route.js
 * author: Anuj Gupta
 * desc: route file for course
 */

var courseService = require('../service/courseService');
var requestMiddleware = require('../middlewares/request.middleware');

var BASE_URL_V1 = "/api/sb/v1/course";

module.exports = function(app) {

    app.route(BASE_URL_V1 + '/search')
        .post(requestMiddleware.createAndValidateRequestBody, courseService.searchCourseAPI);

    app.route(BASE_URL_V1 + '/create')
        .post(requestMiddleware.createAndValidateRequestBody, courseService.createCourseAPI);

    app.route(BASE_URL_V1 + '/update/:courseId')
        .patch(requestMiddleware.createAndValidateRequestBody, courseService.updateCourseAPI);

    app.route(BASE_URL_V1 + '/review/:courseId')
        .post(requestMiddleware.createAndValidateRequestBody, courseService.reviewCourseAPI);

    app.route(BASE_URL_V1 + '/publish/:courseId')
        .get(requestMiddleware.createAndValidateRequestBody, courseService.publishCourseAPI);

    app.route(BASE_URL_V1 + '/get/:courseId')
        .get(requestMiddleware.createAndValidateRequestBody, courseService.getCourseAPI);

    app.route(BASE_URL_V1 + '/get/mycourse/:createdBy')
        .get(requestMiddleware.createAndValidateRequestBody, courseService.getMyCourseAPI);

    app.route(BASE_URL_V1 + '/hierarchy/:courseId')
        .get(requestMiddleware.createAndValidateRequestBody, courseService.getCourseHierarchyAPI);
};
