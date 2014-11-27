/// <reference path="../app.ts" />
/// <reference path="../../../../typings/ember/ember.d.ts" />

'use strict';

App.CategoryRoute = Em.Route.extend({
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
		this.transitionTo('category',
			M.String.sanitize(transition.params.category.title)
		);
	},

	model: function (params: any) {
		console.log("w CategoryRoute!");
		var title = 'Category:' + Mercury.Utils.String.sanitize(params.title);
		return App.CategoryModel.find({
			basePath: Mercury.wiki.basePath,
			title: title,
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
