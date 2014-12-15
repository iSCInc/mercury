/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

App.CategoryMixin = Em.Mixin.create({
	searchQuery: '',

	search: function (): void {
		var category = this.get('model');
		category.search(this.get('searchQuery'));
	}.observes('searchQuery'),

	actions: {
		loadMore: function (): void {
			var category = this.get('model');
			category.loadMore();
		},

		clearSearch: function (): void {
			this.set('searchQuery', '');
			var category = this.get('model');
			category.search(null);
		}
	}

});
