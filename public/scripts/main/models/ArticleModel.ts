/// <reference path="../app.ts" />
/// <reference path="../../mercury/utils/string.ts" />
/// <reference path="../../mercury/modules/Ads.ts" />
/// <reference path="../../../../typings/i18next/i18next.d.ts" />

declare var DS: any;

App.Article = DS.Model.extend({
	details: DS.belongsTo('detail'),
	topContributors: DS.hasMany('top_contributor'),
	article: DS.belongsTo('article_data'),
	content: DS.attr('string'),
	relatedPages: DS.hasMany('related_page'),
	adsContext: DS.belongsTo('ads_context')
});

App.User = DS.Model.extend({
	id: DS.attr('number'),
	url: DS.attr('string'),
	avatar: DS.attr('string'),

	article_data: DS.belongsTo('article_data')
});

App.TopContributor = DS.Model.extend({
	user_id: DS.attr('number'),
	title: DS.attr('string'),
	name: DS.attr('string'),
	url: DS.attr('string'),
	numberofedits: DS.attr('number'),
	avatar: DS.attr('string')

	//article: DS.belongsTo('article')
});

App.Detail = DS.Model.extend({
	id: DS.attr('number'),
	title: DS.attr('string'),
	ns: DS.attr('number'),
	url: DS.attr('string'),
	comments: DS.attr('number'),
	type: DS.attr('string'),
	abstract: DS.attr('string'),
	thumbnail: DS.attr('string'),
	//original_dimenstions

	revision: DS.belongsTo('revision')
});

App.Revision = DS.Model.extend({
	id: DS.attr('number'),
	user: DS.attr('string'),
	user_id: DS.attr('number'),
	timestamp: DS.attr('string'),

	detail: DS.belongsTo('detail')
});

App.ArticleData = DS.Model.extend({
	content: DS.attr('string'),

	media: DS.hasMany('media'),
	users: DS.hasMany('user'),
	categories: DS.hasMany('category')
});

App.RelatedPage = DS.Model.extend({
	url: DS.attr('string'),
	title: DS.attr('string'),
	//id: DS.attr('number'),
	imgUrl: DS.attr('string'),
	text: DS.attr('string')
});

App.AdsContext = DS.Model.extend({
});

App.Article.reopenClass({
	url: function (params: {title: string; redirect?: string}) {
		var redirect = '';

		if (params.redirect) {
			redirect += '?redirect=' + encodeURIComponent(params.redirect);
		}

		return App.get('apiBase') + '/article/' + params.title + redirect;
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
	}
});
