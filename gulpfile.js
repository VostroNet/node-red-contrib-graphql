"use strict"; //eslint-disable-line
require("babel-core/register");
const gulp = require("gulp");
const eslint = require("gulp-eslint");
const del = require("del");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const mocha = require("gulp-mocha");


gulp.task("clean", () => {
  return del(["build/**/*"]);
});

var babelOptions = {
  "presets": [[
    "env", {
      "targets": {
        "node": "current",
      },
      "useBuiltIns": true,
    },
  ], "stage-0"],
  "plugins": ["transform-class-properties"],
};

gulp.task("compile", ["lint"], () => {
  return gulp.src(["src/**/*"])
    .pipe(sourcemaps.init({identityMap: true}))
    .pipe(babel(babelOptions))
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
  gulp.watch(["src/**/*.*"], ["compile"]);
});

gulp.task("default", ["compile"]);
