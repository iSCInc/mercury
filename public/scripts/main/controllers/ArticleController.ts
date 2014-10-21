/// <reference path="../app.ts" />
/// <reference path="../../baseline/Wikia.d.ts" />
/// <reference path="../mixins/VisibilityStateManager.ts" />
'use strict';

App.ArticleController = Em.ObjectController.extend({
	needs: ['application'],

	queryParams: ['file', 'commentsPage'],
	file: null,
	commentsPage: null,

	displayUsers: function (): any[] {
		return this.get('users').slice(0, 5);
	}.property('users'),

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
			}
		},
		/**
		 * scrolllToSection
		 * @description Function scrolls page to the selected section. It can be passed with '#' when 
		 * comes from reloading page or without '#' when comes from clicking on menu-elecemt (pure id)
		 * then we have to add '#' to make it consistent
		 */
		scrollToSection: function (hash:string) {
		 	if (hash.indexOf("#") !== 0) {
		 		hash='#'+hash;
		 	}
		 	if ($(hash).length){
			 	location.hash = hash;
			 	var height = $('nav.site-head').height();
			 	console.log("offset top: " + $(hash).offset().top + "height: " + height);
	            window.scrollTo(0, $(hash).offset().top - height);
		 	}
		 	this.send('trackClick', 'toc', 'header');
		}
	}
});
