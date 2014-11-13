/// <reference path="../app.ts" />
'use strict';

App.ApplicationController = Em.Controller.extend({
	init: function () {
		this.setProperties({
			domain: Em.getWithDefault(Mercury, 'wiki.dbName', 'community'),
			siteName: Em.getWithDefault(Mercury, 'wiki.siteName', 'Wikia'),
			language: Em.getWithDefault(Mercury, 'wiki.language', 'en'),
			globalAnimSpeed: 100
		});

		this._super();
	}
});
