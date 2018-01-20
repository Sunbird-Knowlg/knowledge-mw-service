var gulp = require('gulp')
var rimraf = require('rimraf')
var jasmineNode = require('gulp-jasmine-node')
var istanbul = require('gulp-istanbul')

var paths = {
  scripts: ['middlewares/*.js', 'models/*.js', 'routes/*.js', 'service/*.js', 'app.js', '!service/conceptService.js'],
  tests: ['test/*.js', 'test/**/*.js'],
  coverage: 'coverage'
}

// Below task is to clean up the coverage reports
gulp.task('clean-coverage-report', function (cb) {
  rimraf(paths.coverage, cb)
})

// Below task is used setup source files
gulp.task('pre-test-node', function () {
  return gulp.src(paths.scripts)
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire())
})

// Below task used to run the test cases
gulp.task('test', ['clean-coverage-report', 'pre-test-node'], function () {
  return gulp.src(paths.tests)
    .pipe(jasmineNode({
      timeout: 10000
    }))
    .pipe(istanbul.writeReports({dir: paths.coverage, reporters: ['html', 'text-summary']}))
})
