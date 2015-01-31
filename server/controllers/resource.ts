/// <reference path="../../typings/hapi/hapi.d.ts" />
/// <reference path="../../typings/mercury/mercury-server.d.ts" />

/**
 * @description Resource controller
 */
import MediaWiki = require('../lib/MediaWiki');

/**
 * Get resource type
 * @param {ResourceTypeRequestParams} params
 * @param {Function} next
 */
export function getResourceType (params: ResourceTypeRequestParams, next: (error: any, data: any) => void): void {
	var wikiRequest = new MediaWiki.WikiRequest({
		wikiDomain: params.wikiDomain
	});

	logger.debug({
		wiki: params.wikiDomain,
		uri: params.uri
	}, 'Fetching resource type');

	wikiRequest
		.getResourceType(params.uri)
		.then((resourceType: any) => {
			next(null, resourceType);
		}, (error: any) => {
			next(error, null);
		});
}
