/// <reference path="../app.ts" />
'use strict';

interface ArticleMedia {
	[index: string]: any;
	caption: string;
	fileUrl: string;
	height: number;
	link: string;
	title: string;
	type: string;
	url: string;
	user: string;
	width: number;
}

App.Media = DS.Model.extend({
	user: DS.belongsTo('article_data')
});
