/*
 * Path list for tasks
 */
var path = require('path'),
	basePath = 'www';

module.exports = {
	base: basePath,
	baseFull: path.resolve(basePath),
	vendor: {
		src: 'public/vendor/**/*',
		dest: basePath + '/public/vendor'
	},
	locales: {
		src: 'public/locales/**/*.json',
		dest: basePath + '/public/locales'
	},
	styles: {
		src: ['!public/styles/_*.scss', 'public/styles/*.scss'],
		watch: 'public/styles/**/*.scss',
		dest: basePath + '/public/styles'
	},
	scripts: {
		front: {
			src: 'public/scripts',
			dest: basePath + '/public/scripts',
			files: '**/*.ts',
			dFiles: '**/*.d.ts'
		},
		back: {
			src: 'server/**/*.ts',
			config: 'config/*.ts',
			dest: basePath
		}
	},
	views: {
		src: 'views/**/*.+(hbs|js)',
		dest: basePath + '/views'
	},
	templates: {
		src: 'public/templates',
		dest: basePath + '/public/templates',
		files: '**/*.hbs'
	},
	symbols: {
		src: 'public/svg/symbols',
		dest: basePath + '/public/svg',
		files: '*.svg'
	},
	images: {
		src: ['public/svg/images/*', 'public/images/*'],
		dest: basePath + '/public/images'
	},
	nodeModules: {
		src: 'node_modules',
		dest: basePath + '/node_modules'
	},
	server: {
		script: basePath + '/server/server.js'
	},
	config: {
		path: 'config/',
		baseFile: 'localSettings.base.ts',
		exampleFile: 'localSettings.example.ts',
		testFile: 'localSettings.test.ts',
		runtimeFile: 'localSettings.ts'
	}
};
