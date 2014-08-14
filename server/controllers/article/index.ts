/// <reference path="../../../typings/hapi/hapi.d.ts" />
/// <reference path="../../../typings/bluebird/bluebird.d.ts" />
/**
 * @description Article controller
 */
import MediaWiki = require('../../lib/MediaWiki');
import Promise = require('bluebird');

/**
 * @description Handler for /article/{wiki}/{articleId} -- Currently calls to Wikia public JSON api for article:
 * http://www.wikia.com/api/v1/#!/Articles
 * This API is really not sufficient for semantic routes, so we'll need some what of retrieving articles by using the
 * article slug name
 * @param getWikiInfo whether or not to make a WikiRequest to get information about the wiki
 */
export function createFullArticle(getWikiInfo: boolean, data: any, callback: any, err: any) {
	var article = new MediaWiki.ArticleRequest({
		name: data.wikiName,
		title: data.articleTitle
	});

	if (getWikiInfo) {
		var wiki = new MediaWiki.WikiRequest({
			name: data.wikiName
		});
	}

	article.articleDetails()
		.then((response: any) => {
			var articleDetails = response,
				articleId;

			/**
			 * Have to check articleDetails.items in case the wiki is not present on the devbox and the
			 * API returns bad data.
			 */
			if (articleDetails.items && Object.keys(articleDetails.items).length) {
				articleId = parseInt(Object.keys(articleDetails.items)[0], 10);

				var props = {
					article: article.article(),
					relatedPages: article.relatedPages([articleId]),
					userData: article.getTopContributors(articleId).then((contributors: any) => {
						return article.userDetails([contributors.items]).then((users) => {
							return {
								contributors: contributors,
								users: users
							};
						});
					}),
					wikiNamespaces: null,
					wikiNavData: null
				};

				if (getWikiInfo) {
					props.wikiNamespaces = wiki.wikiNamespaces();
					props.wikiNavData = wiki.localNavData();
				}

				Promise.props(props)
					.then((result: any) => {
						var articleResponse = {
							wikiName: data.wikiName,
							articleTitle: data.articleTitle,
							articleDetails: articleDetails.items[articleId],
							contributors: result.userData.contributors,
							userDetails: result.userData.users,
							relatedPages: result.relatedPages,
							payload: result.article.payload,
							namespaces: null,
							navData: null
						};
						if (getWikiInfo) {
							articleResponse.namespaces = result.wikiNamespaces.query.namespaces;
							articleResponse.navData = result.wikiNavData;
						}
						callback(articleResponse);
					}).catch((error) => {
						err(error);
					});
			} else {
				err(response);
			}
		});
}

export function handleRoute(request: Hapi.Request, reply: Function): void {
	var data = {
		wikiName: request.params.wikiName,
		articleTitle: decodeURIComponent(request.params.articleTitle)
	};

	createFullArticle(false, data, (data) => {
		reply(data);
	}, (error) => {
			reply(error);
	});
}
