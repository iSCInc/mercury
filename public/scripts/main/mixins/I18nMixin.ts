/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

App.I18nMixin = Em.Mixin.create({
	allKeys: {
			key: null,
			value: null
		},

	t: function(value: string, options: any): any {
		var namespace = '';
		console.log("mixin#translate, i18n", value)

		/*Object.keys(options.hash).forEach((key: string) => {
			if (key === 'ns') {
				namespace = options.hash[key];
			} else if (key !== 'boundOptions' && options.hash[key]) {
				params[key] = this[String(options.hash[key])];
			}
		});*/

		return  function () { return i18n.t(value, {})}.property('isLoaded');
		//return 'dupa'
	},

	isLoaded: false,

	init: function (): any {

		i18n.init({
			resGetPath: '/public/locales/__lng__/translation.json',
			detectLngQS: 'uselang',
			lng: 'en',//application.get('language'),
			fallbackLng: 'en',
			debug: true,
			useLocalStorage: false
		}, () => {
			console.log('dsf');
			this.set('isLoaded', true);
		});

		this._super();
	}
});
