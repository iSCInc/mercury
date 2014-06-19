/// <reference path="../typings/hapi/hapi.d.ts" />

import path = require('path');

function routes(server) {
	// all the routes that should resolve to loading single page app entry view
	var indexRoutes: string[] = ['/', '/w/{parts*}'],
		SECOND: number = 1000;

	indexRoutes.forEach(function(route: string) {
		server.route({
			method: 'GET',
			path: route,
			config: {
				cache: {
					expiresIn: 60 * SECOND,
				},
				handler: require('./controllers/home/index')
			}
		});
	});

	// eg. http://www.example.com/article/muppet/Kermit_the_Frog
	server.route({
		method: 'GET',
		path: '/article/{wikiName}/{articleTitle}',
		config: {
			cache: {
				expiresIn: 60 * SECOND,
			},
			handler: require('./controllers/article').handleRoute
		}
	});

	// eg. http://www.example.com/articleComments/muppet/154
	server.route({
		method: 'GET',
		path: '/articleComments/{wiki}/{articleId}/{page?}',
		handler: require('./controllers/articleComments').handleRoute
	});

	// Set up static assets serving, this is probably not a final implementation as we should probably setup
	// nginx or apache to serve static assets and route the rest of the requests to node.
	server.route({
		method: 'GET',
		path: '/public/{path*}',
		handler: {
			directory: {
				path: path.join(__dirname, '../public'),
				listing: false,
				index: false
			}
		}
	});
}

export = routes;
