/// <reference path="../../typings/bluebird/bluebird.d.ts" />
/// <reference path="../../typings/node/node.d.ts" />
/// <reference path="../../typings/request/request.d.ts" />

/**
 * @description Mediawiki API functions
 */

import localSettings = require('../../config/localSettings');
import Logger = require('./Logger');
import Proxy = require('./Proxy');
import Request = require('request');
import Promise = require('bluebird');

/**
 * Wrapper class for making API search requests
 */
export class SearchRequest {
	wikiDomain: string;

	/**
	 * Search request constructor
	 *
	 * @param params
	 */
	constructor (params: {wikiDomain: string}) {
		this.wikiDomain = params.wikiDomain;
	}

	/**
	 * Default parameters to make the request url clean -- we may
	 * want to customize later
	 * @param query Search query
	 * @returns
	 */
	searchForQuery (query: string): Promise<any> {
		var url = createUrl(this.wikiDomain, 'api/v1/SearchSuggestions/List', {
			query: query
		});

		return fetch(url);
	}
}

/**
 * @desc a wrapper for making API requests for info about the wiki
 *
 */
export class WikiRequest {
	wikiDomain: string;

	/**
	 * WikiRequest constructor
	 *
	 * @param params
	 */
	constructor (params: {wikiDomain: string}) {
		this.wikiDomain = params.wikiDomain;
	}

	/**
	 * Gets general wiki information
	 *
	 * @returns {Promise<any>}
	 */
	getWikiVariables (): Promise<any> {
		var url = createUrl(this.wikiDomain, 'api/v1/Mercury/WikiVariables');

		return fetch(url);
	}
}

/**
 * Gets article data
 */
export class ArticleRequest {
	wikiDomain: string;

	/**
	 * ArticleRequest constructor
	 * @param wikiDomain
	 */
	constructor (wikiDomain: string) {
		this.wikiDomain = wikiDomain;
	}

	/**
	 * Fetch article data
	 *
	 * @param title
	 * @param redirect
	 * @returns {Promise<any>}
	 */
	fetch (title: string, redirect: string) {
		var url = createUrl(this.wikiDomain, 'api/v1/Mercury/Article', {
			title: title,
			redirect: redirect
		});

		return fetch(url);
	}

	comments (articleId: number, page: number = 0) {
		var url = createUrl(this.wikiDomain, 'api/v1/Mercury/ArticleComments', {
			id: articleId,
			page: page
		});

		return fetch(url);
	}
}

/**
 * Fetch http resource
 *
 * @param url the url to fetch
 * @param redirects the number of redirects to follow, default 1
 */
export function fetch (url: string, redirects: number = 1): Promise<any> {
	return new Promise((resolve, reject) => {
		var proxyAddress = Proxy.getProxy(),
			requestOptions: Request.Options = {
				url: url,
				maxRedirects: redirects,
				timeout: localSettings.backendRequestTimeout
			},
			logOptions = {
				url: url
			};
		if (proxyAddress) {
			requestOptions.proxy = proxyAddress;
		}
		Logger.debug(requestOptions, 'Fetching');
		Request(requestOptions, (err: any, res: any, payload: any): void => {
			if (err) {
				Logger.error({url: url, error: err, proxy: proxyAddress}, 'Error fetching url');
				reject(err);
			} else {
				if (res.headers['content-type'].match('application/json')) {
					payload = JSON.parse(payload);
				}

				resolve(payload);
			}
		});
	});
}

/**
 * Create request URL
 *
 * @param wikiDomain
 * @param path
 * @param params
 * @returns {string}
 */
export function createUrl(wikiDomain: string, path: string, params: any = {}): string {
	var qsAggregator: string[] = [],
		queryParam: string;

	Object.keys(params).forEach(function(key) {
		queryParam = (typeof params[key] !== 'undefined') ?
			key + '=' + encodeURIComponent(params[key]) :
			key;

		qsAggregator.push(queryParam);
	});

	return 'http://' + wikiDomain + '/' + path + (qsAggregator.length > 0 ? '?' + qsAggregator.join('&') : '');
}
