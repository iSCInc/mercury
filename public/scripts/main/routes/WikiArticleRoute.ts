/// <reference path="../app.ts" />

'use strict';

App.WikiArticleRoute = Em.Route.extend({
	model: function(params) {
		return App.WikiArticleModel.find({
			title: params.articleTitle,
			wiki: this.modelFor('wiki').get('wikiName')
		});
	},
	afterModel: function(model, transition) {
		// I think this is irrelevant now; the model should never be resolved if
		// there is a failure.
		// debugger;
		// if (model.exception) {
		// 	debugger;
		// 	transition.abort();			
		// }
	}
});
