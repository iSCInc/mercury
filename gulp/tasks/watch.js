var gulp = require('gulp'),
	gutil = require('gulp-util'),
	log = require('../utils/logger'),
	paths = require('../paths'),
	path = require('path');

gulp.task('watch', ['assets'], function () {
	log('Watching files');

	gulp.watch(paths.styles.watch, ['sass']).on('change', function (event) {
		log('Style changed:', gutil.colors.green(event.path));
		/*
		 * Baseline is a scss file that gets inlined, so the views must be recompiled
		 * when it is changed
		 */
		if (event.path.match('baseline.scss')) {
			gulp.start('build');
		}
	});

	gulp.watch(path.join(
			paths.scripts.front.src,
			paths.scripts.front.files
		), ['tslint', 'scripts-front'])
		.on('change', function (event) {
			log('Script changed:', gutil.colors.green(event.path));
			if (event.path.match('baseline')) {
				gulp.start('build');
			}
		});

	gulp.watch(paths.scripts.back.src, ['tslint', 'scripts-back']).on('change', function (event) {
		log('Script for backend changed:', gutil.colors.green(event.path));
	});

	gulp.watch(path.join(
			paths.templates.src,
			paths.templates.files
		), ['templates']).on('change', function (event) {
		log('Template changed:', gutil.colors.green(event.path));
	});

	gulp.watch(path.join(
			paths.svg.src,
			paths.svg.files
		), ['build']).on('change', function (event) {
		log('Svg changed:', gutil.colors.green(event.path));
	});

	gulp.watch(paths.views.src, ['build']).on('change', function (event) {
		log('Views changed:', gutil.colors.green(event.path));
	});
});