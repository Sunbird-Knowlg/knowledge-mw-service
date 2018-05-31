/**
 * file: course-route.js
 * author: Anuj Gupta
 * desc: route file for course
 */

var courseService = require('../service/courseService')
var requestMiddleware = require('../middlewares/request.middleware')

var BASE_URL = '/v1/course'

module.exports = function (app) {
  app.route(BASE_URL + '/search')
    .post(requestMiddleware.checkAndAddChannelFilters, requestMiddleware.createAndValidateRequestBody,
      courseService.searchCourseAPI)

  app.route(BASE_URL + '/create')
    .post(requestMiddleware.createAndValidateRequestBody, courseService.createCourseAPI)

  app.route(BASE_URL + '/update/:courseId')
    .patch(requestMiddleware.createAndValidateRequestBody, courseService.updateCourseAPI)

  app.route(BASE_URL + '/review/:courseId')
    .post(requestMiddleware.createAndValidateRequestBody, courseService.reviewCourseAPI)

  app.route(BASE_URL + '/publish/:courseId')
    .get(requestMiddleware.createAndValidateRequestBody, courseService.publishCourseAPI)

  app.route(BASE_URL + '/read/:courseId')
    .get(requestMiddleware.createAndValidateRequestBody, courseService.getCourseAPI)

  app.route(BASE_URL + '/read/mycourse/:createdBy')
    .get(requestMiddleware.createAndValidateRequestBody, courseService.getMyCourseAPI)

  app.route(BASE_URL + '/hierarchy/:courseId')
    .get(requestMiddleware.createAndValidateRequestBody, courseService.getCourseHierarchyAPI)

  app.route(BASE_URL + '/hierarchy/update')
    .patch(requestMiddleware.createAndValidateRequestBody, requestMiddleware.validateToken,
      requestMiddleware.hierarchyUpdateApiAccess, courseService.updateCourseHierarchyAPI)
}
