/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

App.CategoryMixin = Em.Mixin.create({
	searchQuery: '',
	filteredArticles: function (filter?: any) {
		filter = this.get('searchQuery');
		var members = this.get('categorymembers');
		var rx = new RegExp(filter, 'gi');
		return members.filter( function (member: any) {
			return member.title.match(rx);
		});
	}.property('@each','searchQuery'),

	actions: {
		loadMore: function () {
			console.log("cmcontinue: ", this.get('cmcontinue'));
			var category = this.get('model');
			category.loadMore();
		},

		clearSearch: function (): void {
			this.set('searchQuery', '');
		}
	}

});