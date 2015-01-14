/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

App.I18nMixin = Em.Mixin.create({
	isLoaded: {},
	i18nInited: false,
	translated: [],

	t: function(value: string, options: any): any {
		//debugger
		console.log("isLoaded: ", this.get('isLoaded'));
		console.log("jezyk: ", i18n.lng())
		console.log("i18n.t(value,...", i18n.t(value))
		//return function () { 
			return i18n.t(value, {count: this.get('count')})
		//}
		//}.property('isLoaded', 'count', 'lol')
	//}.property('isLoaded', 'count', 'lol'),
	},

	translateStrings: function() {
		console.log("funkcja translateStrings na jezyk", i18n.lng())
		if (this.translations.length) { 
				this.set('translated', 
					this.translations.map((tr) => {
						return this.t(tr)
					})
				);
				//this.set('isLoaded.' + i18n.lng(), true );
		}
	}.observes('i18nInited', 'isLoaded'),

	init: function (): any { //wykonuje sie tylko raz- na starcie
		console.log('dsf'); 

		i18n.init({
			resGetPath: '/public/locales/__lng__/translation.json',
			detectLngQS: 'uselang',
			lng: App.get('language'),
			fallbackLng: 'en',
			debug: true,
			useLocalStorage: false
			}, () => {
				this.set('i18nInited', true);
				//this.set('isLoaded.' + App.get('language'), true);
			}
		);

		this._super();
	}
});
