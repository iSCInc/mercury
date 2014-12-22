/// <reference path="../app.ts" />
/// <reference path="../../mercury/utils/string.ts" />
/// <reference path="../../mercury/modules/Ads.ts" />
/// <reference path="../../../../typings/i18next/i18next.d.ts" />

interface Response {
	data: {
		details: {
			id: number;
			title: string;
			ns: string;
			url: string;
			revision: {
				id: number;
				user: string;
				user_id: number;
				timestamp: string;
			};
			comments: number;
			type: string;
			abstract: string;
			thumbnail: string;
		};
		article: {
			content: string;
			media: any[];
			users: any;
			categories: any[];
		};
		relatedPages: any[];
		topContributors: any[];
		adsContext: any
	};
}

declare var DS: any;

App.Article = DS.Model.extend({
	id: DS.attr('number'),
	ns: DS.attr('number'),
	content: DS.attr('string'),
	basePath: DS.attr('string'),
	cleanTitle: DS.attr('string'),
	comments: DS.attr('number'),
	//sections: [], WTF? there is no sections in API
	title: DS.attr('string'),
	wiki: DS.attr('string'),
	//categories: DS.attr('string'),

	//categories: DS.hasMany('category'), maybe later
	media: DS.hasMany('media'),
	topContributors: DS.hasMany('user'),
	users: DS.hasMany('user')
	
});

App.User = DS.Model.extend({
	user_id: DS.attr('string'),
	title: DS.attr('string'),
	url: DS.attr('string'),

	articles: DS.hasMany('articles')
});

App.Article.reopenClass({
	url: function (params: {title: string; redirect?: string}) {
		var redirect = '';

		if (params.redirect) {
			redirect += '?redirect=' + encodeURIComponent(params.redirect);
		}

		return App.get('apiBase') + '/article/' + params.title + redirect;
	},

	find2: function (params: {basePath: string; wiki: string; title: string; redirect?: string}) {
		console.log("find!");
		console.log("this.store", this.store);
		var model = this.store.createRecord('article'); //App.Article.create(params);
		console.log("find, model", model);
		if (Mercury._state.firstPage) {
			this.setArticle(model);
			return model;
		}

		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			Em.$.ajax({
				url: this.url(params),
				dataType: 'json',
				success: (data) => {
					this.setArticle(model, data);
					resolve(model);
				},
				error: (err) => {
					reject($.extend(err, model));
				}
			});
		});
	}, 

	getPreloadedData: function () {
		var article = Mercury.article,
			adsInstance: Mercury.Modules.Ads;

		Mercury._state.firstPage = false;

		// On first page load the article content is available only in HTML
		article.content = $('.article-content').html();

		// Setup ads
		if (Mercury.adsUrl) {
			adsInstance = Mercury.Modules.Ads.getInstance();
			adsInstance.init(Mercury.adsUrl, () => {
				adsInstance.reload(article.adsContext);
			});
		}

		delete Mercury.article;
		return article;
	},

	setArticle: function (model: typeof App.Article, source = this.getPreloadedData()) {
		console.log("setArticle", model);
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
