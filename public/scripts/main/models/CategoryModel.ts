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
	isMore: true,
	cleanTitle: null,

	/**
	 * @desc Evaluates if we want to get url to first category page or load more category
	 * members (and whether it is possible). Creates url.
	 * @param {boolean} more value which is true when the method was called
	 * to obtain url to the next part of category pages (called from 'loadMore' method)
	 * @returns {string} url to appropriate category page
	 */
	categoryUrl: function (more?: boolean) {
		var cmcontinue = '';
		this.set('cleanTitle', this.get('title').replace('Category:', ''));

		if (this.get('cmcontinue') && more) {
			cmcontinue += '?cmcontinue=' + this.get('cmcontinue');
		}
		return App.get('apiBase') + '/category/' + this.get('cleanTitle') + cmcontinue;
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
			this.set('membersExist', true);
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
		this.setProperties(categoryData);
	},

	/**
	 * @desc updates categorymembers list. New category pages are added to 
	 * list, not replaced.
	 * @returns {Em.RSVP.Promise}
	 */
	loadMore: function () {
		var tmp = this.get('categorymembers');
		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			Em.$.ajax({
				url: this.categoryUrl(true),
				dataType: 'json',
				success: (categoryData) => {
					this.setCategory(categoryData);
					tmp.pushObjects(this.get('categorymembers'));
					this.set('categorymembers', tmp);
					this.animateCategoryArticles();
					resolve(this);
				},
				error: (err) => {
					reject($.extend(err));
				}
			});
		});
	},

	/**
	 * @desc checks if query param is empty- in this case loads all possible category pages
	 * (by default first 10). If the query exists, gets data from API and creates a new promise.
	 * Additional filtering data received from API needed due to construction of api.php which
	 * allows only for sorting from certain pattern (not searching in)
	 * @param {string} query value to search for
	 * @returns {Em.RSVP.Promise}
	 */
	search: function (query: string) {
		if (query) {
			var searchUrl = App.get('apiBase') + '/category/' + this.get('cleanTitle') + '&format=json&cmsort=sortkey&cmstartsortkeyprefix=' + query;
		}
		$('.category-pages ul li').slideUp(400);
		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			Em.$.ajax({
				url: searchUrl ? searchUrl : this.categoryUrl(),
				dataType: 'json',
				success: (categoryData) => {
					if (query) {
						var members = categoryData.query.categorymembers,
							rx = new RegExp('^'+query, 'i');
						categoryData.query.categorymembers = members.filter( function (member: any) {
							return member.title.match(rx);
						});
					}
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
		var el = $('.category-pages ul li');
		console.log("animacja! animateCategoryArticles");
		el.slideUp(400);
		el.slideDown(400);
	}
});
