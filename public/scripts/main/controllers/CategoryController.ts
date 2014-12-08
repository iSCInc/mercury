/// <reference path="../app.ts" />
/// <reference path="../../baseline/mercury.d.ts" />
/// <reference path="../mixins/VisibilityStateManager.ts" />
'use strict';

App.CategoryController = Em.ObjectController.extend({
	needs: ['application'],

	queryParams: ['file', 'commentsPage', 'map'],
	file: null,
	commentsPage: null,
	map: null,

	searchQuery: '',

	filteredArticles: function () {
		var filter = this.get('searchQuery'),
			members = this.get('categorymembers'),
			rx = new RegExp(filter, 'gi');
		return members.filter( function (member: any) {
			return member.title.match(rx);
		});
	}.property('@each','searchQuery'), 

	actions: {
		updateHeaders: function (headers: NodeList): void {
			var article = this.get('model');
			article.set('sections', headers);
		},

		changePage: function (title: string): void {
			App.VisibilityStateManager.reset();
			this.set('file', null);
			this.transitionToRoute('article', title);
		},

		articleRendered: function () {
			if (this.get('file')) {
				this.send('openLightbox', 'media-lightbox');
			} else if (this.get('map')) {
				var foundMap = Em.$('a[data-map-id=' + this.get('map') + ']'),
					title = foundMap.data('map-title'),
					url = foundMap.data('map-url'),
					id = foundMap.data('map-id');

				this.send('openLightbox', 'map-lightbox', {
					title: title,
					url: url,
					id: id
				});
			}
		}
	}
});
