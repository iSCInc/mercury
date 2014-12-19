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

		//

		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			Em.$.getJSON(
				this.url(params)
				//'http://shadowofmordor.wikia.local:8000/api/v1/article/Sea_of_N%C3%BArnen'
				).done((data) => {
					resolve(this)
				}).fail((err) => {
					reject(this)
				});
			})
	},

	findAll: function(params: {url: string; title: string; redirect?: string}) {
		console.log("find all!");
	}
});

var ArticleSerializer = DS.RESTSerializer.extend({

	extractArray: function(store, type, payload) {
		console.log("payload.data: ", payload.data);
		var data: any = {};
		data = payload.data;

		//TODO IMPLEMENT -> use this instead of setArtcile

		return this._super(store, type, payload);
	},

	setArticle: function (model: typeof App.Article, source = this.getPreloadedData()) {
		var data: any = {};

		if (source.error) {
			var error = source.error;

			data = {
				article: error.details,
				cleanTitle: M.String.normalize(model.title),
				error: error
			};
		} else if (source) {
			if (source.details) {
				var details = source.details;

				data = $.extend(data, {
					ns: details.ns,
					cleanTitle: details.title,
					comments: details.comments,
					id: details.id
					//user: details.revision.user_id
				});
			}

			if (source.article) {
				var article = source.article;

				data = $.extend(data, {
					content: article.content || source.content,
					users: article.users,
					media: DS.Store.createRecord('media', {
						type: article.media.type,
						url: article.media.url,
						user: article.media.user
					}),
					categories: DS.Store.createRecord('category', {
						title: article.category.title,
						url: article.category.url
					})
				});
			}

			if (source.relatedPages) {
				/**
				 * Code to combat a bug observed on the Karen Traviss page on the Star Wars wiki, where there
				 * are no relatedPages for some reason. Moving forward it would be good for the Wikia API
				 * to handle this and never return malformed structures.
				 */
				 data.relatedPages = source.relatedPages;
				}

				if (source.adsContext) {
					data.adsContext = source.adsContext;
				}

				if (source.topContributors) {
				// Same issue: the response to the ajax should always be valid and not undefined
				data.topContributors = source.topContributors;
			}
		}

		model.setProperties(data);
	}
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
