const gulp = require('gulp')
const pug = require('gulp-pug')
const sass = require('gulp-sass')(require('sass'))
const cleanCSS = require('gulp-clean-css')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const browserSync = require('browser-sync').create()
const del = require('del')

const paths = {
    pug: {
        src: 'src/pages/*.pug',
        dest: 'dist/',
    },
    scss: {
        src: 'src/styles/**/*.scss',
        dest: 'dist/css/',
    },
    js: {
        src: 'src/scripts/**/*.js',
        dest: 'dist/js/',
    },
    images: {
        src: 'src/assets/img/**/*',
        dest: 'dist/assets/img/',
    },
    fonts: {
        src: 'src/assets/fonts/**/*',
        dest: 'dist/assets/fonts/',
    },
}
function clean() {
    return del.deleteAsync(['dist'])
}

function html() {
    return gulp
        .src(paths.pug.src)
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(paths.pug.dest))
        .pipe(browserSync.stream())
}

function styles() {
    return gulp
        .src(paths.scss.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scss.dest))
        .pipe(browserSync.stream())
}

function scripts() {
    return gulp.src(paths.js.src).pipe(gulp.dest(paths.js.dest)).pipe(browserSync.stream())
}

function images() {
    return gulp.src(paths.images.src, { encoding: false })
        .pipe(gulp.dest(paths.images.dest));
}

function fonts() {
    return gulp.src(paths.fonts.src).pipe(gulp.dest(paths.fonts.dest))
}

function serve() {
    browserSync.init({
        server: {
            baseDir: 'dist',
        },
    })
    gulp.watch('src/pages/**/*.pug', html)
    gulp.watch(paths.scss.src, styles)
    gulp.watch(paths.js.src, scripts)
    gulp.watch(paths.images.src, images)
    gulp.watch(paths.fonts.src, fonts)
    gulp.watch('dist/*.html').on('change', browserSync.reload)
}

exports.clean = clean
exports.html = html
exports.styles = styles
exports.scripts = scripts
exports.images = images
exports.fonts = fonts
exports.serve = gulp.series(clean, gulp.parallel(html, styles, scripts, images, fonts), serve)
exports.build = gulp.series(clean, gulp.parallel(html, styles, scripts, images, fonts))