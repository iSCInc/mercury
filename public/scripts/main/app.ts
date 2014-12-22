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
		console.log( "relatedTypes: ", Ember.get(App.Article, 'relatedTypes'));

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

var ArticleSerializer = DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
	attrs: {
		details: {embedded: 'always'},
		topContributors: {embedded: 'always'},
		article: {embedded: 'always'},
		relatedPages: {embedded: 'always'},
		adsContext: {embedded: 'always'}
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
