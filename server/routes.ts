/// <reference path="../typings/hapi/hapi.d.ts" />
/// <reference path="../typings/boom/boom.d.ts" />

import path = require('path');
import Hapi = require('hapi');
import Boom = require('boom');
import localSettings = require('../config/localSettings');
import Utils = require('./lib/Utils');
import Caching = require('./lib/Caching');
import Tracking = require('./lib/Tracking');
import MediaWiki = require('./lib/MediaWiki');
import logger = require('./lib/Logger');
import util = require('util');
import search = require('./controllers/search');
import article = require('./controllers/article/index');
import comments = require('./controllers/article/comments');

var wikiDomains: {
		[key: string]: string;
	} = {},
	cachingTimes = {
		article: {
			enabled: false,
			cachingPolicy: Caching.Policy.Private,
			varnishTTL: Caching.Interval.standard,
			browserTTL: Caching.Interval.default
		},
		articleAPI: {
			enabled: false,
			cachingPolicy: Caching.Policy.Private,
			varnishTTL: Caching.Interval.disabled,
			browserTTL: Caching.Interval.disabled
		},
		commentsAPI: {
			enabled: false,
			cachingPolicy: Caching.Policy.Private,
			varnishTTL: Caching.Interval.disabled,
			browserTTL: Caching.Interval.disabled
		},
		searchAPI: {
			enabled: false,
			cachingPolicy: Caching.Policy.Private,
			varnishTTL: Caching.Interval.disabled,
			browserTTL: Caching.Interval.disabled
		}
	};

/**
 * Get cached Media Wiki domain name from the request host
 *
 * @param {string} host Request host name
 * @returns {string} Host name to use for API
 */
function getWikiDomainName (host: string): string {
	var wikiDomain: string;

	host = Utils.clearHost(host);
	wikiDomain = wikiDomains[host];

	return wikiDomains[host] = wikiDomain ? wikiDomain : Utils.getWikiDomainName(localSettings, host);
}

/**
 * Prepares article data to be rendered
 * TODO: clean up this function
 *
 * @param {Hapi.Request} request
 * @param result
 */
function beforeArticleRender (request: Hapi.Request, result: any): void {
	var title: string,
		articleDetails: any,
		userDir = 'ltr';

	if (result.article.details) {
		articleDetails = result.article.details;
		title = articleDetails.cleanTitle ? articleDetails.cleanTitle : articleDetails.title;
	} else if (request.params.title) {
		title = request.params.title.replace(/_/g, ' ');
	} else {
		title = result.wiki.mainPageTitle.replace(/_/g, ' ');
	}

	if (result.article.article) {
		// we want to return the article content only once - as HTML and not JS variable
		result.articleContent = result.article.article.content;
		delete result.article.article.content;
	}

	if (result.wiki.language) {
		userDir = result.wiki.language.userDir;
		result.isRtl = (userDir === 'rtl');
	}

	result.displayTitle = title;
	result.isMainPage = (title === result.wiki.mainPageTitle.replace(/_/g, ' '));
	result.canonicalUrl = result.wiki.basePath + result.wiki.articlePath + title.replace(/ /g, '_');
	result.themeColor = Utils.getVerticalColor(localSettings, result.wiki.vertical);
	result.query = {
		noExternals: !!(request.query.noexternals && request.query.noexternals !== '0' && request.query.noexternals !== '')
	};
}

/**
 * Handles article response from API
 *
 * @param {Hapi.Request} request
 * @param reply
 * @param error
 * @param result
 */
function onArticleResponse (request: Hapi.Request, reply: any, error: any, result: any = {}): void {
	var code = 200,
		response: Hapi.Response;

	if (!result.article.article && !result.wiki.dbName) {
		//if we have nothing to show, redirect to our fallback wiki
		reply.redirect(localSettings.redirectUrlOnNoData);
	} else {
		Tracking.handleResponse(result, request);

		if (error) {
			code = error.code || error.statusCode || 500;
			result.error = JSON.stringify(error);
		}

		beforeArticleRender(request, result);

		response = reply.view('application', result);
		response.code(code);
		Caching.setResponseCaching(response, cachingTimes.article);
	}
}

/**
 * Adds routes to the server
 *
 * @param server
 */
function routes (server: Hapi.Server) {
	server.route({
		method: 'GET',
		path: localSettings.apiBase + '/proxy/{proxyUri*}',
		handler: (request: Hapi.Request, reply: any): void => {
			var proxyUri = request.params.proxyUri,
				mediaWikiUrl = MediaWiki.createUrl(getWikiDomainName(request.headers.host), proxyUri);

			logger.debug({
				uri: proxyUri,
				mediaWikiUrl: mediaWikiUrl
			}, 'Proxy handler');

			reply.proxy({
				redirects: localSettings.proxyMaxRedirects,
				passThrough: true,
				localStatePassThrough: true,
				mapUri: (request: Hapi.Request, next: Function) => {
					next(null, mediaWikiUrl, {
						// let's try to force the skin
						'X-Skin': 'oasis'
					});
				},
				onResponse: (err: any, res: Hapi.Response, request: Hapi.Request, reply: any, settings: any, ttl: any) => {
					logger.debug({
						requestHeaders: request.headers,
						responseHeaders: res.headers
					}, 'Proxy handler onResponse');

					return err ? reply(err) : reply(res);
				}
			});
		}
	});
}

export = routes;
