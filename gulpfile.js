'use strict';

var paths,
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    complexity = require('gulp-complexity'),
    runSequence = require('run-sequence'),
    help = require('./tasks/help'),
    open = require('open');

paths = {
    lint: [
        'lib/**/*.js', 'test/**/*.js', 'bin/**/*.js', 'tasks/**/*.js', '*.js'
    ],
    complexity: ['lib/**/*.js', 'test/**/*.js', 'tasks/**/*.js', '*.js'],
    cover: ['lib/**/*.js'],
    unit: ['test/**/*.js', '!test/fixture/*.js'],
    watch: ['lib/**/*.js'],
    'coverage-report': './coverage/lcov-report/index.html'
};

function lintTask() {
    return gulp.src(paths.lint)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
}

function complexityTask() {
    return gulp.src(paths.complexity)
        .pipe(complexity({
            halstead: 29,
            cyclomatic: 17
        }));
}

function coverTask() {
    return gulp.src(paths.cover)
        .pipe(istanbul({includeUntested: true}))
        .pipe(istanbul.hookRequire());
}

function mochaTest() {
    return gulp.src(paths.unit)
        .pipe(mocha());
}

function unitTask() {
    return mochaTest()
        .pipe(istanbul.writeReports({
            reporters: ['lcov', 'json']
        }));
}

function unitCiTask() {
    return mochaTest()
        .pipe(istanbul.writeReports());
}

function testTask(done) {
    return runSequence(
        'lint',
        'complexity',
        'unit',
        done
    );
}

function ciTask(done) {
    return runSequence(
        'lint',
        'complexity',
        'unit-ci',
        done
    );
}

function coverageReportTask() {
    open(paths['coverage-report']);
}

function watchTask() {
    return gulp.watch(paths.watch, ['test']);
}

gulp.task('default', help);
gulp.task('help', help);
gulp.task('lint', lintTask);
gulp.task('complexity', complexityTask);
gulp.task('test-cover', coverTask);
gulp.task('unit', ['test-cover'], unitTask);
gulp.task('unit-ci', ['test-cover'], unitCiTask);
gulp.task('test', testTask);
gulp.task('ci', ciTask);
gulp.task('coverage-report', coverageReportTask);
gulp.task('watch', watchTask);
