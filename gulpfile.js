'use strict';

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    complexity = require('gulp-complexity'),
    runSequence = require('run-sequence');

function complexityTask() {
    return gulp.src(['lib/**/*.js', 'test/**/*.js'])
        .pipe(complexity({
            halstead: 29,
            cyclomatic: 17
        }));
}

function lintTask() {
    return gulp.src(['lib/**/*.js', 'test/**/*.js', 'bin/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
}

function watchTask() {
    return gulp.watch('lib/**/*.js', ['lint', 'test']);
}

function defaultTask(done) {
    return runSequence('lint', 'test', done);
}

function coverTask() {
    return gulp.src(['lib/**/*.js'])
        .pipe(istanbul({includeUntested: true}))
        .pipe(istanbul.hookRequire());
}

function coverageTask() {
    return gulp.src(['test/**/*.js', '!test/fixture/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports());
}

function reportTask() {
    require('open')('./coverage/lcov-report/index.html');
}

function testTask(done) {
    return runSequence(
        'complexity',
        'test-cover',
        'test-coverage',
        done
    );
}

gulp.task('lint', lintTask);
gulp.task('complexity', complexityTask);
gulp.task('test-cover', coverTask);
gulp.task('test-coverage', ['test-cover'], coverageTask);
gulp.task('test', testTask);
gulp.task('test-watch', watchTask);
gulp.task('report', reportTask);
gulp.task('default', defaultTask);
