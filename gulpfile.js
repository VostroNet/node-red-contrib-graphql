"use strict"; //eslint-disable-line
const gulp = require("gulp");
const eslint = require("gulp-eslint");
const del = require("del");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");


gulp.task("clean", () => {
  return del(["build/**/*"]);
});

gulp.task("copy", ["compile"], () => {
  gulp.src(["src/**/*", "!src/**/*.js"])
    .pipe(gulp.dest("./build/"));
});

gulp.task("compile", ["lint"], () => {
  return gulp.src(["src/**/*.js"])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write(".", {includeContent: false, sourceRoot: "../src/"}))
    .pipe(gulp.dest("build"));
});

gulp.task("lint", ["clean"], () => {
  return gulp.src(["src/**/*.js"])
    .pipe(eslint({fix: true}))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
gulp.task("watch", () => {
  gulp.watch(["src/**/*.*"], ["copy"]);
});

gulp.task("default", ["copy"]);
