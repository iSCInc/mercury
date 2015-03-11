import Caching = require('../../lib/Caching');
import MW = require('../../lib/MediaWiki');
import Utils = require('../../lib/Utils');
import localSettings = require('../../../config/localSettings');
import wrapResult = require('./presenters/wrapResult');

var cachingTimes = {
	enabled: false,
	cachingPolicy: Caching.Policy.Private,
	varnishTTL: Caching.Interval.disabled,
	browserTTL: Caching.Interval.disabled
};

export function get (request: Hapi.Request, reply: any): void {
	var params = {
		wikiDomain: Utils.getWikiDomainName(localSettings, request.headers.host),
		query: request.params.query
	};

	new MW.SearchRequest({
			wikiDomain: params.wikiDomain
		})
		.searchForQuery(params.query)
		.then((result: any) => {
			var error = result.exception || null;
			Caching.setResponseCaching(reply(wrapResult(error, result)), cachingTimes);
		})
		.catch((err: any) => {
			reply(err).code(err.exception.code || 500);
		});
}
