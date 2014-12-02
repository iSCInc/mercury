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
	cmcontinue: null,

	categoryUrl: function (more?: boolean) {

		var next = '';

		if (this.get('cmcontinue') && more) {
			next += '?cmcontinue=' + this.get('cmcontinue');
			//console.log('diana next: ', next);
		}
		//console.log(App.get('apiBase') + '/category/' + this.cleanTitle + next);
		return App.get('apiBase') + '/category/' + this.cleanTitle + next;
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
		console.log("setcategory z danymi: ", source);
		var categoryData: any = {},
			cmcontinue = null,
			oldCD;

		//oldCD = this.get(categoryData); 
		//if (oldCD) oldCD.pushObjects(categorymembers);
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
		cmcontinue = source['query-continue']['categorymembers']['cmcontinue'];
		if (cmcontinue) { //cannot read property 'categorymembers' of undefined
			this.set('cmcontinue' , cmcontinue);
		}
		this.setProperties(categoryData);
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
	}
});
