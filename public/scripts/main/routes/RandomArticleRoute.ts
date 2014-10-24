/// <reference path="../app.ts" />
/// <reference path="../../../../typings/ember/ember.d.ts" />

'use strict';

App.RandomArticleRoute = Em.Route.extend({
	model: function (params: any) {
		return App.ArticleModel.findRandom({
			wiki: this.controllerFor('application').get('domain')
		});
	},

	afterModel: function (model: any, transition: EmberStates.Transition, queryParams?: any) {
		this.transitionTo('article', model.title);
	}
});
