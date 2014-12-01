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

	categoryUrl: function () {
		console.log("w CategoryModel.categoryUrl; title: ", this.get('title')); //action=query&list=categorymembers&cmtitle=Category:Locations
		//return App.get('apiBase') + '/wikia/' + params.title; // /api/vi/wikia/
		return 'http://shadowofmordor.wikia.local:8000/api.php?action=query&list=categorymembers&cmtitle='+ this.get('title') + '&format=json';
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
						console.log("error");
					}
				});
			});
	},

	setCategory: function (source: any) {
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
	this.setProperties(categoryData);
	}
});
