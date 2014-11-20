/// <reference path="../app.ts" />
/// <reference path="../../baseline/mercury.d.ts" />
/// <reference path="../mixins/VisibilityStateManager.ts" />
'use strict';

App.CategoryController = Em.ObjectController.extend({
	needs: ['application'],

	actions: {
    printDiana: function() {
      Ember.Logger.log('diana...');
    }
  }
});
