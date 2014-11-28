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
	};
}

App.CategoryModel = App.ArticleModel.extend({
});

App.CategoryModel.reopenClass({

	categoryUrl: function (params: {title: string; redirect?: string}) {
		console.log("w CategoryModel.categoryUrl; title: ", params.title); //action=query&list=categorymembers&cmtitle=Category:Locations
		//return App.get('apiBase') + '/wikia/' + params.title; // /api/vi/wikia/
		return 'http://shadowofmordor.wikia.local:8000/api.php?action=query&list=categorymembers&cmtitle=Category:Locations&format=json';
	},

	find: function (params: {basePath: string; wiki: string; title: string; redirect?: string}) {
		var model = App.CategoryModel.create(params),
			articleModel = this._super(params, model),
			categoryModel = new Em.RSVP.Promise((resolve: Function, reject: Function) => {
				Em.$.ajax({
					url: this.categoryUrl(params),
					dataType: 'json',
					success: (categoryData) => {
						articleModel.then((tmp) => {
							App.CategoryModel.setCategory(tmp, categoryData);
							resolve(tmp);
						});
					},
					error: (err) => {
						reject($.extend(err, model));
					}
				});
			});
		return categoryModel;
	},

	setCategory: function (model: typeof App.ArticleModel, source: any) {
		var categoryData: any = {};

		if (source.error) {
			var error = source.error;
			categoryData = {
				error: error
			};
		} else if (source.query.categorymembers) {
				var categorymembers = source.query.categorymembers;
				categoryData = {
					categorymembers: categorymembers,
				};
		}
	console.log("-----> sa categorymembers!!!!", categoryData);
	model.setProperties(categoryData);
	}
});
