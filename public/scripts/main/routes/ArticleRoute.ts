/// <reference path="../app.ts" />
/// <reference path="../../../../typings/ember/ember.d.ts" />

'use strict';

App.ArticleRoute = Em.Route.extend({
	queryParams: {
		file: {
			replace: true
		},
		commentsPage: {
			replace: true
		}
	},

	beforeModel: function (transition: EmberStates.Transition) {
		if (Mercury.error) {
			transition.abort();
		}

		this.transitionTo('article',
			M.String.sanitize(transition.params.article.title)
		);
	},

	model: function (params: any) {
		console.log("article title: ", params.title);
		console.log("mercudy wiki namespaces", Mercury.wiki.namespaces[14]);
		if (params.title.indexOf(Mercury.wiki.namespaces[14]) > -1 )
		{
			console.log("article title: ", Mercury.Utils.String.sanitize(params.title));
			console.log("jest to strona kategorii!");
			return App.CategoryModel.find({
				basePath: Mercury.wiki.basePath,
				title: Mercury.Utils.String.sanitize(params.title),
				wiki: this.controllerFor('application').get('domain')
			});
		}
		return App.ArticleModel.find({
			basePath: Mercury.wiki.basePath,
			title: Mercury.Utils.String.sanitize(params.title),
			wiki: this.controllerFor('application').get('domain')
		});
	},

	actions: {
		error: function (error: any, transition: EmberStates.Transition) {
			transition.abort();
			Em.Logger.warn(error);
			return true;
		},

		willTransition: function (transition: EmberStates.Transition) {
			// dismiss side nav when {{#link-to 'article'}} is called from side nav
			this.controllerFor('application').send('collapseSideNav');
			// notify a property change on soon to be stale model for observers (like
			// the Table of Contents menu) can reset appropriately
			this.notifyPropertyChange('cleanTitle');
		},
		// TODO: This currently will scroll to the top even when the app has encountered
		// an error. Optimally, it would remain in the same place.
		didTransition: function () {
			window.scrollTo(0, 0);
			// bubble up to application didTransition hook
			return true;
		}
	}
});
