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
	moreCategoriesAvailable: true,
	membersNotFound: false,

	cleanTitle: function (): string {
		var categoryPattern = '%@:%@'.fmt(
			Em.getWithDefault(Mercury, 'wiki.namespaces.14', 'Category'),
			this.get('title')
		);
		return this.get('title').replace(categoryPattern + ':', '');
	}.property('title'),

	/**
	 * @desc Evaluates if we want to get url to first category page or load more category
	 * members (and whether it is possible). Creates url.
	 * @param {boolean} more value which is true when the method was called
	 * to obtain url to the next part of category pages (called from 'loadMore' method)
	 * @returns {string} url to appropriate category page
	 */
	categoryUrl: function (more?: boolean) {
		var cmcontinue = '';

		if (this.get('cmcontinue') && more) {
			cmcontinue += '?cmcontinue=' + this.get('cmcontinue');
		}
		return App.get('apiBase') + '/category/' + this.get('cleanTitle') + cmcontinue;
	},
	/**
	 * @desc Calls the ArticleModel.find funciton and after 
	 * requests ajax to get and set additional category informations.
	 * @returns {Em.RSVP.Promise}
	 */
	find: function () {
		return this._super().then(() => {
			return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
				Em.$.getJSON(
					this.categoryUrl()
				).done((categoryData) => {
					this.setCategory(categoryData);
					resolve(this)
				}).fail((err) => {
					this.set('membersNotFound', true);
					reject(this)
				});
			})
		});
	},

	setCategory: function (source: any) {
		var categoryData: any = {},
			cmcontinue: string = null,
			categorymembers: any = {},
			queryContinue: any = {};

		if (source.error) {
			var error = source.error;
			categoryData = {
				error: error
			};
			return false;
		}
		categorymembers = source.query.categorymembers;
		if (categorymembers) {
			this.set('membersExist', true);
			categoryData = {
				categorymembers: categorymembers
			};
		}
		queryContinue = source['query-continue'];
		if (queryContinue) {
			this.set('cmcontinue' , queryContinue['categorymembers']['cmcontinue']);
		} else {
			this.set('moreCategoriesAvailable', false);
		}
		this.setProperties(categoryData);
	},

	/**
	 * @desc updates categorymembers list. New category pages are added to 
	 * list, not replaced.
	 * @returns {Em.RSVP.Promise}
	 */
	loadMore: function () {
		var tempCategoryMembers = this.get('categorymembers');
		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			Em.$.getJSON(
				this.categoryUrl(true)
			).done((categoryData) => {
				this.setCategory(categoryData);
				tempCategoryMembers.pushObjects(this.get('categorymembers'));
				this.set('categorymembers', tempCategoryMembers);
				this.animateCategoryArticles();
				resolve(this)
			}).fail((err) => {
				this.set('membersNotFound', true);
				reject(this)
			});
		});
	},

	/**
	 * @desc checks if query param is empty- in this case loads all possible category pages
	 * (by default first 10). If the query exists, gets data from API and creates a new promise.
	 * Additional filtering data received from API needed due to construction of api.php which
	 * allows only for sorting from certain pattern (not searching in).
	 * Sets moreCategoriesAvailable to true to reset consequence of previous loadMore/search actions
	 * @param {string} query value to search for
	 * @returns {Em.RSVP.Promise}
	 */
	search: function (query: string) {
		this.set('moreCategoriesAvailable', true);
		if (query) {
			var searchUrl = App.get('apiBase') + '/category/' + this.get('cleanTitle') + '&format=json&cmsort=sortkey&cmstartsortkeyprefix=' + query;
		}
		$('.category-pages li').slideUp(400);
		return new Em.RSVP.Promise((resolve: Function, reject: Function) => {
			Em.$.ajax({
				url: searchUrl ||  this.categoryUrl(),
				dataType: 'json',
				success: (categoryData) => {
					if (query) {
						var members = categoryData.query.categorymembers,
							rx = new RegExp('^' + query, 'i');
						categoryData.query.categorymembers = members.filter((member: any): string[] => {
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
		var el = $('.category-pages li');
		el.slideUp(400);
		el.slideDown(400);
	}
});
