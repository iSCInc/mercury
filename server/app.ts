/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/hapi/hapi.d.ts" />
/// <reference path="../config/localSettings.d.ts" />

// NewRelic is only enabled on one server and that logic is managed by chef, which passes it to our config
if (process.env.NEW_RELIC_ENABLED === 'true') {
	require('newrelic');
}

import hapi = require('hapi');
import path = require('path');
import url = require('url');
import localSettings = require('../config/localSettings');
import logger = require('./lib/Logger');
import cluster = require('cluster');

/**
 * Application class
 */
class App {
	//Counter for maxRequestPerChild
	private counter = 1;

	/**
	 * Creates new `hapi` server
	 */
	constructor() {
		var server: hapi.Server = hapi.createServer(localSettings.host, localSettings.port, {
				// ez enable cross origin resource sharing
				cors: true,
				cache: this.getCacheSettings(localSettings.cache),
				state: {
					cookies: {
						strictHeader: false
					}
				}
			});

		this.setupLogging(server);

		server.views({
			engines: {
				hbs: require('handlebars')
			},
			isCached: true,
			layout: true,
			/*
			 * Helpers are functions usable from within handlebars templates.
			 * @example the getScripts helper can be used like: <script src="{{ getScripts 'foo.js' }}">
			 */
			helpersPath: path.join(__dirname, '../views', '_helpers'),
			path: path.join(__dirname, '../views'),
			partialsPath: path.join(__dirname, '../views', '_partials')
		});

		server.ext('onPreResponse', this.onPreResponseHandler);

		require('./methods')(server);
		/*
		 * Routes
		 */
		require('./routes')(server);

		server.start(function() {
			logger.info({url: server.info.uri}, 'Server started');
			process.send('Server started');
		});

		server.on('tail', () => {
			this.counter++;

			if (this.counter >= localSettings.maxRequestsPerChild) {
				//This is a safety net for memory leaks
				//It restarts child so even if it leaks we are 'safe'
				server.stop({
					timeout: localSettings.backendRequestTimeout
				}, function () {
					logger.info('Max request per child hit: Server stopped');
					cluster.worker.kill();
				});
			}
		});

		process.on('message', function(msg: string) {
			if (msg === 'shutdown') {
				server.stop({
					timeout: localSettings.workerDisconnectTimeout
				}, function() {
					logger.info('Server stopped');
				});
			}
		});
	}

	/**
	 * Create caching config object based on caching config
	 *
	 * @param {object} cache Cache settings
	 * @returns {object} Caching config
	 */
	private getCacheSettings(cache: CacheInterface): CacheInterface {
		if (typeof cache === 'object') {
			cache.engine = require('catbox-' + cache.engine);
			return cache;
		}
		// Fallback to memory
		logger.warn('No cache settings found. Falling back to memory');
		return {
			name: 'appcache',
			engine: require('catbox-memory')
		};
	}

	/**
	 * Set `X-Backend-Response-Time` header to every response. Value is in ms
	 *
	 * @param {object} request
	 * @param {function} next
	 */
	private onPreResponseHandler(request: Hapi.Request, next: Function): void {
		var response = <Hapi.Response>(request.response),
			responseTimeSec = (Date.now() - request.info.received) / 1000;
		if (response && response.header) {
			response.header('X-Backend-Response-Time', responseTimeSec.toFixed(3));
		}
		next();
	}

	/**
	 * Setup logging for Hapi events
	 *
	 * @param server
	 */
	private setupLogging(server: Hapi.Server): void {
		server.on('log', (event: any, tags: Array<string>) => {
			logger.info({
				data: event.data,
				tags: tags
			}, 'Log');
		});

		server.on('internalError', (request: Hapi.Request, err: Error) => {
			logger.error({
				wiki: request.headers.host,
				text: err.message,
				url: url.format(request.url),
				referrer: request.info.referrer
			}, 'Internal error');
		});

		server.on('response', (request: Hapi.Request) => {
			// If there is an errors and headers are not present, set the response time to -1 to make these
			// errors easy to discover
			var responseTime = request.response.headers
					&& request.response.headers.hasOwnProperty('x-backend-response-time')
				? parseFloat((<Hapi.Response>request.response).headers['x-backend-response-time'])
				: -1;

			logger.info({
				wiki: request.headers.host,
				code: (<Hapi.Response>request.response).statusCode,
				url: url.format(request.url),
				responseTime: responseTime,
				referrer: request.info.referrer
			}, 'Response');
		});
	}
}

var app: App = new App();
