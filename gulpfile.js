require("babel-polyfill");

const JS_SRC = "./resources/js/src/";
const JS_DIST = "./resources/js/dist/";
const OUTPUT_PREFIX = "ceres";

// import gulp
var gulp = require("gulp");
var gutil = require("gulp-util");
var sourcemaps = require("gulp-sourcemaps");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var browserify = require("browserify");
var babelify = require("babelify");
var glob = require("glob");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var autoprefixer = require("gulp-autoprefixer");
var copy = require("gulp-copy");
var insert = require("gulp-insert");
var fs = require("fs");
var path = require("path");




// Build app
gulp.task("build:app", function()
{
    var builder = browserify({
        entries  : ["app/main.js"].concat( glob.sync("app/!(services)/**/*.js", {cwd: JS_SRC}) ),
        debug    : true,
        basedir  : JS_SRC,
        paths    : ["app/"],
        transform: babelify
    });

    return builder.bundle()
        .on("error", function(err)
        {
            console.log(err.toString());
            this.emit("end");
        })
        .pipe(source(OUTPUT_PREFIX + "-app.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        //.pipe(addSrc.append(JS_SRC + "app/main.js"))
        .pipe(concat(OUTPUT_PREFIX + "-app.js"))
        .pipe(sourcemaps.write(".", {
            includeContent: false,
            sourceRoot    : "../src"
        }))
        .pipe(gulp.dest(JS_DIST));
});

// Build app for productive ( with eslint)
gulp.task("build:productive-app", function()
{
    var builder = browserify({
        entries  : ["app/main.js"].concat( glob.sync("app/!(services)/**/*.js", {cwd: JS_SRC}) ),
        debug    : true,
        basedir  : JS_SRC,
        paths    : ["app/"],
        transform: babelify
    });

    return builder.bundle()
        .pipe(source(OUTPUT_PREFIX + "-app.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        //.pipe(addSrc.append(JS_SRC + "app/main.js"))
        .pipe(concat(OUTPUT_PREFIX + "-app.js"))
        .pipe(sourcemaps.write(".", {
            includeContent: false,
            sourceRoot    : "../src"
        }))
        .pipe(gulp.dest(JS_DIST));
});

// Build Vendor
gulp.task("build:productive-vendor", function()
{
    var libraries = require(JS_SRC + "vendor.productive.json");

    return gulp.src(libraries)
        .pipe(sourcemaps.init())
        .pipe(concat(OUTPUT_PREFIX + "-vendor.productive.js"))
        .pipe(sourcemaps.write(".", {sourceRoot: "../src/libraries"}))
        .pipe(gulp.dest(JS_DIST));
});

gulp.task("build:vendor", function()
{
    var libraries = require(JS_SRC + "vendor.json");

    return gulp.src(libraries)
        .pipe(sourcemaps.init())
        .pipe(concat(OUTPUT_PREFIX + "-vendor.js"))
        .pipe(sourcemaps.write(".", {sourceRoot: "../src/libraries"}))
        .pipe(gulp.dest(JS_DIST));
});

// Bundle everything
gulp.task("build:bundle", gulp.series([
    "build:productive-app",
    "build:vendor",
    "build:productive-vendor",
]), function()
{
    return gulp.src([
        JS_DIST + OUTPUT_PREFIX + "-vendor.productive.js",
        JS_SRC + "app.config.js",
        JS_DIST + OUTPUT_PREFIX + "-app.js"
    ])
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(concat(OUTPUT_PREFIX + ".js"))
        .pipe(gulp.dest(JS_DIST))
        .pipe(rename(OUTPUT_PREFIX + ".min.js"))
        .pipe(uglify({
            compress: {
                collapse_vars: false
            }
        }).on("error", gutil.log))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(JS_DIST));
});

gulp.task("build", gulp.series([
    "build:bundle"
]));