'use strict';

var paths,
    fs = require('fs'),
    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    complexity = require('gulp-complexity'),
    runSequence = require('run-sequence'),
    open = require('open'),
    help = require('./tasks/help'),
    exec = require('./lib/exec');

paths = {
    lint: [
        'lib/**/*.js', 'test/**/*.js', 'bin/**/*.js', 'tasks/**/*.js', '*.js'
    ],
    complexity: ['lib/**/*.js', 'test/**/*.js', 'tasks/**/*.js', '*.js'],
    plato: 'lib',
    cover: ['lib/**/*.js'],
    unit: ['test/**/*.js', '!test/fixture/*.js'],
    watch: ['lib/**/*.js'],
    'coverage-report-directory': 'reports/coverage',
    'coverage-report': 'reports/coverage/lcov-report/index.html',
    'plato-report-directory': 'reports/complexity',
    'plato-report': 'reports/complexity/index.html'
};

function lintTask() {
    return gulp.src(paths.lint)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .pipe(jscs());
}

function platoTask() {
    exec.spawnSyncStream('node_modules/plato/bin/plato', [
        '--dir',
        paths['plato-report-directory'],
        '--recurse',
        '--title',
        'Node GH',
        '--jshint',
        'test/.jshintrc',
        'lib',
        'test',
        'bin',
        'tasks',
        'gulpfile.js'
    ]);
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
            reporters: ['lcov', 'json'],
            dir: paths['coverage-report-directory']
        }));
}

function unitCiTask() {
    return mochaTest()
        .pipe(istanbul.writeReports({
            dir: paths['coverage-report-directory']
        }));
}

function testTask(done) {
    return runSequence(
        'lint',
        'plato',
        'complexity',
        'unit',
        done
    );
}

function ciTask(done) {
    return runSequence(
        'lint',
        'plato',
        'complexity',
        'unit-ci',
        done
    );
}

function coverageReportTask() {
    var file = paths['coverage-report'];

    if (!fs.existsSync(file)) {
        console.error('Run gulp test first.');
        return;
    }

    open(file);
}

function platoReportTask() {
    var file = paths['plato-report'];

    if (!fs.existsSync(file)) {
        console.error('Run gulp test first.');
        return;
    }

    open(file);
}

function watchTask() {
    return gulp.watch(paths.watch, ['test']);
}

function ciReportsTask() {
    open('https://node-gh.github.io/reports/');
}

gulp.task('default', help);
gulp.task('help', help);
gulp.task('lint', lintTask);
gulp.task('plato', platoTask);
gulp.task('complexity', complexityTask);
gulp.task('test-cover', coverTask);
gulp.task('unit', ['test-cover'], unitTask);
gulp.task('unit-ci', ['test-cover'], unitCiTask);
gulp.task('test', testTask);
gulp.task('ci', ciTask);
gulp.task('coverage-report', coverageReportTask);
gulp.task('plato-report', platoReportTask);
gulp.task('watch', watchTask);
gulp.task('ci-reports', ciReportsTask);
