const config = require("./Gulpfile.json");

const gulp = require("gulp");
const webpack = require('webpack-stream');
var del = require('del');

// Tasks
gulp.task("webpack", () => {
	return gulp.src("src/xrick.js")
		.pipe(webpack({
			mode: "development",
			output: {
				library: "RickJS",
				filename: "xrick.debug.js"
			}
		}))
		.pipe(gulp.dest(config.dir.build));
});

gulp.task('clean', () => {
    return del(config.dir.clean);
});

gulp.task("build-web", gulp.series("clean", "webpack"));
