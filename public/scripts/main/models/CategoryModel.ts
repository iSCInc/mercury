/// <reference path="../app.ts" />
/// <reference path="../../mercury/utils/string.ts" />
/// <reference path="../../mercury/modules/Ads.ts" />
/// <reference path="../../../../typings/i18next/i18next.d.ts" />

interface Response {
	categoryData: {
		categorymembers: {
			pageid: number;
			ns: number;
			title: string;
		};
		cmcontinue: string;
	};
}

App.CategoryModel = App.ArticleModel.extend({
	categorymembers: [],
	isMore: true,
	cleanTitle: null,
	// in ms
	debounceDuration: 250,
	// Whether or not to display the loading search results message (en: 'Loading...')
	isLoadingSearchResults: false,

	categoryUrl: function (more?: boolean) {
		var next = '';
		this.set('cleanTitle', this.get('title').replace('Category:', ''));

		if (this.get('cmcontinue') && more) {
			next += '?cmcontinue=' + this.get('cmcontinue');
		}
		return App.get('apiBase') + '/category/' + this.get('cleanTitle') + next;
	},

	find: function () {
		this._super();
		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			Em.$.ajax({
				url: this.categoryUrl(),
				dataType: 'json',
				success: (categoryData) => {
					this.setCategory(categoryData);
					resolve(this);
				},
				error: (err) => {
					reject($.extend(err));
				}
			});
		});
	},

	setCategory: function (source: any) {
		var categoryData: any = {},
			cmcontinue: string = null;

		if (source.error) {
			var error = source.error;
			categoryData = {
				error: error
			};
		return false;
		}
		if (source.query.categorymembers) {
			var categorymembers = source.query.categorymembers;
			categoryData = {
				categorymembers: categorymembers
			};
		}
		
		if (source['query-continue']) {
			this.set('cmcontinue' , source['query-continue']['categorymembers']['cmcontinue']);
		} else {
			this.set('isMore', false);
		}

		var tmp = this.get('categorymembers');
		this.setProperties(categoryData);

		tmp.pushObjects(categoryData.categorymembers);
		this.set('categorymembers', tmp);

		//$('.category-pages ul li').addClass('animated bounceInDown');
	},

	loadMore: function () {
		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			Em.$.ajax({
				url: this.categoryUrl(true),
				dataType: 'json',
				success: (categoryData) => {
					this.setCategory(categoryData);
					resolve(this);
				},
				error: (err) => {
					reject($.extend(err));
				}
			});
		});
	},

	search: function (query: string) {
		if (query) {
			var searchUrl = App.get('apiBase') + '/category/' + this.get('cleanTitle') + '&format=json&cmsort=sortkey&cmstartsortkeyprefix='+query;
		}
		console.log("query: ", query);

		this.set('categorymembers', []); //zeruj kategory members

		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			Em.$.ajax({
				url: searchUrl ? searchUrl : this.categoryUrl(),
				dataType: 'json',
				success: (categoryData) => {
					this.setCategory(categoryData);
					resolve(this);
				},
				error: (err) => {
					reject($.extend(err));
				}
			});
		});
	},

	animateCategoryArticles: function () {
		console.log("animacja! animateCategoryArticles");
		$('.category-pages ul li').addClass('animated bounceInDown');
	}.observes('categorymembers')
});
