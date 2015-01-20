/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/hapi/hapi.d.ts" />
/// <reference path="../config/localSettings.d.ts" />

// NewRelic is only enabled on one server and that logic is managed by chef, which passes it to our config
if (process.env.NEW_RELIC_ENABLED === 'true') {
	require('newrelic');
}

import Hapi = require('hapi');
import path = require('path');
import url = require('url');
import localSettings = require('../config/localSettings');
import logger = require('./lib/Logger');
import cluster = require('cluster');
import Utils = require('./lib/Utils');
import Caching = require('./lib/Caching');

/**
 * Application class
 */
class App {
	//Counter for maxRequestPerChild
	private counter = 1;
	private isDevbox = localSettings.environment === Utils.Environment.Dev;

	/**
	 * Creates new `hapi` server
	 */
	constructor() {
		var server = new Hapi.Server();

		server.connection({
			host: localSettings.host,
			port: localSettings.port
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
			helpersPath: path.join(__dirname, 'views', '_helpers'),
			path: path.join(__dirname, 'views'),
			partialsPath: path.join(__dirname, 'views', '_partials')
		});

		server.ext('onPreResponse', this.getOnPreResponseHandler(this.isDevbox));

		/*
		 * Routes
		 */
		require('./routes')(server);

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

		process.on('message', function (msg: string) {
			if (msg === 'shutdown') {
				server.stop({
					timeout: localSettings.workerDisconnectTimeout
				}, function () {
					logger.info('Server stopped');
				});
			}
		});

		server.start(function () {
			logger.info({url: server.info.uri}, 'Server started');
			process.send('Server started');
		});
	}

	/**
	 * Create new onPreResponseHandler
	 *
	 * @param isDevbox
	 * @returns {function (Hapi.Request, Function): void}
	 */
	private getOnPreResponseHandler (isDevbox: boolean) {
		return (request: Hapi.Request, reply: any): void => {
			var response = request.response,
				responseTimeSec = (Date.now() - request.info.received) / 1000;

			// Assets on devbox must not be cached
			// Variety `file` means response was generated by reply.file() e.g. the directory handler
			if (!isDevbox && response.variety === 'file') {
				Caching.setResponseCaching(response, {
					enabled: true,
					cachingPolicy: Caching.Policy.Public,
					varnishTTL: Caching.Interval.long,
					browserTTL: Caching.Interval.long
				});
			}

			if (response && response.header) {
				response.header('X-Backend-Response-Time', responseTimeSec.toFixed(3));
				response.header('X-Served-By', localSettings.host || 'mercury');
			} else if (response.isBoom) {
				// see https://github.com/hapijs/boom
				logger.error({
					message: response.message,
					code: response.output.statusCode,
					headers: response.output.headers
				}, 'Response is Boom object');
			}

			reply.continue();
		};
	}

	/**
	 * Setup logging for Hapi events
	 *
	 * @param server
	 */
	private setupLogging (server: Hapi.Server): void {
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
				? parseFloat(request.response.headers['x-backend-response-time'])
				: -1;

			logger.info({
				wiki: request.headers.host,
				code: request.response.statusCode,
				url: url.format(request.url),
				userAgent: request.headers['user-agent'],
				responseTime: responseTime,
				referrer: request.info.referrer
			}, 'Response');
		});
	}
}

var app: App = new App();
