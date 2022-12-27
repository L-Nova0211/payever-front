"use strict";

let gulp = require("gulp");

gulp.task("copy:styles", () =>
  gulp.src(["libs/ui/src/lib/components/**/*.scss"])
    .pipe(gulp.dest("dist/libs/ui/components")));
