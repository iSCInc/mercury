/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

interface searchResult {
	resultData: {
		categorymembers: {
			pageid: number;
			ns: number;
			title: string;
		};
		cmcontinue: string;
	};
}

App.CategoryMixin = Em.Mixin.create({
	searchQuery: '',
	result: [],

	actions: {
		loadMore: function () {
			console.log("cmcontinue: ", this.get('cmcontinue'));
			var category = this.get('model');
			category.loadMore();
		},

		search: function () {
			var category = this.get('model');
			category.search(this.get('searchQuery'));
		},

		clearSearch: function (): void {
			this.set('searchQuery', '');
			var category = this.get('model');
			category.search(null);
		}
	}

});