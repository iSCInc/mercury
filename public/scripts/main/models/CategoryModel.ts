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
		//action=query&list=categorymembers&cmtitle=Category:Locations
		return App.get('apiBase') + '/category/' + this.cleanTitle;
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
