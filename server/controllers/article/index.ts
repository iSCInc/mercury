/// <reference path="../../../typings/hapi/hapi.d.ts" />
/// <reference path="../../../typings/bluebird/bluebird.d.ts" />
/// <reference path="../../../typings/mercury/mercury-server.d.ts" />

/**
 * @description Article controller
 */
import MediaWiki = require('../../lib/MediaWiki');
import Promise = require('bluebird');
import logger = require('../../lib/Logger');


/**
 * Handler for /article/{wiki}/{articleId} -- Currently calls to Wikia public JSON api for article:
 * http://www.wikia.com/api/v1/#!/Articles
 * This API is really not sufficient for semantic routes, so we'll need some what of retrieving articles by using the
 * article slug name
 *
 * @param params
 * @param callback
 * @param getWikiInfo whether or not to make a WikiRequest to get information about the wiki
 */
export function createFullArticle(params: ArticleRequestParams, callback: any, getWikiInfo: boolean = false): void {
	var requests = [
			new MediaWiki.ArticleRequest(params.wikiDomain).fetch(params.title, params.redirect)
		];

	logger.debug(params, 'Fetching article');

	if (getWikiInfo) {
		logger.debug({wiki: params.wikiDomain}, 'Fetching wiki variables');

		requests.push(new MediaWiki.WikiRequest({
			wikiDomain: params.wikiDomain
		}).getWikiVariables());
	}

	Promise.all(requests)
		.spread((article: any, wiki: any = {}) => {
			callback(article.exception, article.data, wiki.data);
		})
		.catch((error: any) => {
			callback(error);
		});
}

/**
 * Handler for /article/{wiki}/?random
 * @param params
 * @param callback
 * @returns {"bluebird"<any>}
 */
export function createRandomArticle(params: ArticleRequestParams, callback: any): void {
	logger.debug(params, 'Fetching random article');

	new MediaWiki.ArticleRequest(params.wikiDomain).fetchRandom()
		.then((article) => {
			callback(article.exception, article.data);
		})
		.catch((error) => {
			callback(error);
		});
}

/**
 * Handle Article api request
 * @param request
 * @param reply
 */
export function handleRoute(request: Hapi.Request, reply: Function): void {
	var data: ArticleRequestParams = {
		wikiDomain: request.params.wikiName,
		title: decodeURIComponent(request.params.articleTitle),
		redirect: request.params.redirect
	};

	createFullArticle(data, (error: any, article: any) => {
		reply(error || article);
	});
}
