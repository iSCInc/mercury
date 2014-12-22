/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/ember/ember.d.ts" />
/// <reference path="../../../typings/i18next/i18next.d.ts" />
/// <reference path="../baseline/mercury.d.ts" />
/// <reference path="../mercury/utils/track.ts" />

'use strict';

declare var i18n: I18nextStatic;

var App: any = Em.Application.create({
	language: Em.getWithDefault(Mercury, 'wiki.language.user', 'en'),
	apiBase: Mercury.apiBase || '/api/v1'
});

App.ApplicationStore = DS.Store.extend({
	adapter: 'App.ArticleAdapter'
});

var ArticleAdapter = DS.Adapter.extend({

	url: function (params: {title: string; redirect?: string}) {
		var redirect = '';
		console.log("url! params.title: ", params.title);

		if (params.redirect) {
			redirect += '?redirect=' + encodeURIComponent(params.redirect);
		}

		return App.get('apiBase') + '/article/' + params.title + redirect;
	},

	createRecord: function(store, type, record) {
	},

	find: function(params: {basePath: string; wiki: string; title: string; redirect?: string}) {
		console.log("find! params: ", params);
	},

	findQuery: function(store, type, params: {basePath: string; wiki: string; title: string; redirect?: string}) {
		console.log("this: "+ this);
		console.log("url", this.url(params));

		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			Em.$.getJSON(
				this.url(params)
				).done((data) => {
					resolve(data)
				}).fail((err) => {
					reject(err)
				});
			})
	},

	findAll: function(params: {url: string; title: string; redirect?: string}) {
		console.log("find all!");
	}
});

var ArticleSerializer = DS.RESTSerializer.extend({
	primaryKey: 'details.id',

	// extractArray: function(store, type, payload) {
	// 	var data: any = {};

	// 	if (payload.details) {
	// 		var details = payload.details;
	// 		console.log("details:", details)
	// 		data = $.extend(data, {
	// 			ns: details.ns,
	// 			cleanTitle: details.title,
	// 			comments: details.comments,
	// 			id: details.id,
	// 			title: details.title,
	// 			wiki: 'diana'
	// 			//user: details.revision.user_id
	// 		});
	// 	}

	// 	if (payload.article) {
	// 		var article = payload.article;
	// 		console.log("article.categories", article.categories)

	// 		//data = $.extend(data, {
	// 			//content: article.content || payload.content,
	// 			//users: article.users,
	// 			/*media: store.createRecord('media', {
	// 				type: article.media.type,
	// 				url: article.media.url,
	// 				user: article.media.user
	// 			}),*/
	// 			//categories: article.categories
	// 		//});

	// 		//article.media.forEach(function(medium) {
	// 			//media.push(medium);
	// 		//})
	// 	}

	// 	if (payload.relatedPages) {
	// 		/**
	// 		* Code to combat a bug observed on the Karen Traviss page on the Star Wars wiki, where there
	// 		* are no relatedPages for some reason. Moving forward it would be good for the Wikia API
	// 		* to handle this and never return malformed structures.
	// 		*/
	// 		//data.relatedPages = payload.relatedPages;
	// 	}

	// 	if (payload.adsContext) {
	// 		//data.adsContext = payload.adsContext;
	// 	}

	// 	if (payload.topContributors) {
	// 		// Same issue: the response to the ajax should always be valid and not undefined
	// 		//data.topContributors = payload.topContributors;
	// 	}
	// 	console.log("extractArray: ", arguments);
	// 	console.log("DATA", data);
	// 	console.log("type: ", type.type)
	// 	var a = this._super(store, type, data);
	// 	console.log("a", a);
	// 	return a;
	// }
});

App.initializer({
	name: 'preload',
	initialize: (container: any, application: any) => {
		var debug: boolean = Mercury.environment === 'dev';

		// turn on debugging with querystring ?debug=1
		if (window.location.search.match(/debug=1/)) {
			debug = true;
		}

		App.ArticleAdapter = ArticleAdapter;
		App.ArticleSerializer = ArticleSerializer;

		App.setProperties({
			LOG_ACTIVE_GENERATION: debug,
			LOG_VIEW_LOOKUPS: debug,
			LOG_TRANSITIONS: debug,
			LOG_TRANSITIONS_INTERNAL: debug
		});

		$('html').removeClass('preload');

		i18n.init({
			resGetPath: '/public/locales/__lng__/translations.json',
			detectLngQS: 'uselang',
			lng: application.get('language'),
			fallbackLng: 'en',
			debug: debug,
			resStore: Mercury._state.translations,
			useLocalStorage: false
		});
	}
});
