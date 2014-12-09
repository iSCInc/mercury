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

	search: function () {
		//$('.category-pages ul li').addClass('animated bounceOutDown');
		var category = this.get('model');
		category.search(this.get('searchQuery'));
		$('.search-container')[0].scrollIntoView();
	}.observes('searchQuery'),

	actions: {
		loadMore: function () {
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