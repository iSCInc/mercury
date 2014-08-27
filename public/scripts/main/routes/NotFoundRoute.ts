/// <reference path="../app.ts" />
/// <reference path="../../../../typings/ember/ember.d.ts" />

'use strict';

App.NotFoundRoute = Em.Route.extend({
	/**
 	 * @desc The server has already detected a bad URL and there is already an error
	 * message loaded in the page, so all this hook has to do is prevent any transition
	 * from occurring.
	 */
	beforeModel: function (transition: EmberStates.Transition) {
		transition.abort();
	}
});
