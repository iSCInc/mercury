/// <reference path="../app.ts" />
'use strict';

App.Category = DS.Model.extend({
	title: DS.attr('string'),
	url: DS.attr('string'),

	//articles: DS.hasMany('article')
});
