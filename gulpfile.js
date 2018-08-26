'use strict'

var paths,
    fs = require('fs'),
    gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    complexity = require('gulp-complexity'),
    open = require('opn'),
    help = require('./tasks/help'),
    exec = require('./lib/exec')

paths = {
    complexity: ['lib/**/*.js', 'test/**/*.js', 'tasks/**/*.js', '*.js'],
    plato: 'lib',
    cover: ['lib/**/*.js'],
    unit: ['test/**/*.js', '!test/fixture/*.js'],
    watch: ['lib/**/*.js'],
    'coverage-report-directory': 'reports/coverage',
    'coverage-report': 'reports/coverage/lcov-report/index.html',
    'plato-report-directory': 'reports/complexity',
    'plato-report': 'reports/complexity/index.html',
}

function platoTask(done) {
    exec.spawnSyncStream('node_modules/plato/bin/plato', [
        '--dir',
        paths['plato-report-directory'],
        '--recurse',
        '--title',
        'Node GH',
        'lib',
        'test',
        'bin',
        'tasks',
        'gulpfile.js',
    ])

    done()
}

function complexityTask(done) {
    gulp.src(paths.complexity).pipe(
        complexity({
            halstead: 29,
            cyclomatic: 17,
        })
    )

    done()
}

function coverTask(done) {
    gulp.src(paths.cover)
        .pipe(istanbul({ includeUntested: true }))
        .pipe(istanbul.hookRequire())

    done()
}

function mochaTest() {
    return gulp.src(paths.unit).pipe(mocha())
}

function unitTask(done) {
    mochaTest().pipe(
        istanbul.writeReports({
            reporters: ['lcov', 'json'],
            dir: paths['coverage-report-directory'],
        })
    )

    done()
}

function unitCiTask(done) {
    mochaTest().pipe(
        istanbul.writeReports({
            dir: paths['coverage-report-directory'],
        })
    )

    done()
}

function coverageReportTask(done) {
    var file = paths['coverage-report']

    if (!fs.existsSync(file)) {
        console.error('Run gulp test first.')
        return
    }

    open(file, { wait: false })

    done()
}

function platoReportTask(done) {
    var file = paths['plato-report']

    if (!fs.existsSync(file)) {
        console.error('Run gulp test first.')
        return
    }

    open(file, { wait: false })

    done()
}

function watchTask(done) {
    gulp.watch(paths.watch, ['test'])

    done()
}

function ciReportsTask(done) {
    open('https://node-gh.github.io/reports/', { wait: false })

    done()
}

gulp.task('default', help)
gulp.task('help', help)
gulp.task('test', unitTask)
// gulp.task('test', gulp.series('plato', 'complexity', unitTask))

gulp.task('plato', platoTask)
gulp.task('complexity', complexityTask)
gulp.task('test-cover', coverTask)

gulp.task('ci', unitTask)
// gulp.task('ci', gulp.series('plato', 'complexity', unitCiTask))
gulp.task('unit', gulp.series('test-cover', unitTask))
gulp.task('unit-ci', gulp.series('test-cover', unitCiTask))

gulp.task('coverage-report', coverageReportTask)
gulp.task('plato-report', platoReportTask)
gulp.task('ci-reports', ciReportsTask)

gulp.task('watch', watchTask)
