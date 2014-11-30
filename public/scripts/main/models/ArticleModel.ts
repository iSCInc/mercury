/// <reference path="../app.ts" />
/// <reference path="../../mercury/utils/string.ts" />
/// <reference path="../../mercury/modules/Ads.ts" />
/// <reference path="../../../../typings/i18next/i18next.d.ts" />

interface Response {
	data: {
		details: {
			revision: {
				timestamp: number;
			};
			comments: any;
			id: number;
			ns: string;
			title: string;
		};
		article: {
			content: string;
			user: any;
			media: any[];
			users: any[];
			categories: any[];
		};
		relatedPages: any[];
		userDetails: any[];
		topContributors: any[];
	};
}

App.ArticleModel = Em.Object.extend({
	article: null,
	basePath: null,
	categories: [],
	cleanTitle: null,
	comments: 0,
	media: [],
	mediaUsers: [],
	sections: [],
	title: null,
	user: null,
	users: [],
	wiki: null,
	redirect: null,

	url: function () {
		var redirect = '';

		if (this.get(redirect)) {
			redirect += '?redirect=' + encodeURIComponent(this.get(redirect));
		}
		return App.get('apiBase') + '/article/' + this.get('title') + redirect;
	},

	find: function (model?: typeof App.ArticleModel) {
		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			if (Mercury._state.firstPage) {
				this.setArticle();
				this.resolve();
			}
			else {
				Em.$.ajax({
					url: this.url(),
					dataType: 'json',
					success: (data) => {
						this.setArticle(data);
						this.resolve();
					},
					error: (err) => {
						reject($.extend(err));
					}
				});
			}
		});
	},

	getPreloadedData: function () {
		var article = Mercury.article,
			adsInstance: Mercury.Modules.Ads;
		Mercury._state.firstPage = false;
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

	setArticle: function (source = this.getPreloadedData()) {
		var data: any = {};

		if (source.error) {
			var error = source.error;

			data = {
				article: error.details,
				cleanTitle: M.String.normalize(this.get('title')),
				error: error
			};
		} else if (source) {
			if (source.details) {
				var details = source.details;

				data = $.extend(data, {
					ns: details.ns,
					cleanTitle: details.title,
					comments: details.comments,
					id: details.id,
					user: details.revision.user_id
				});
			}

			if (source.article) {
				var article = source.article;

				data = $.extend(data, {
					article: article.content || source.content,
					mediaUsers: article.users,
					media: App.MediaModel.create({
						media: article.media
					}),
					categories: article.categories
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

		this.setProperties(data);
	}
});
