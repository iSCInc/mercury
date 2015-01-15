/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

App.I18nMixin = Em.Mixin.create({
	isLoaded: {},
	i18nInited: false,

	t: function(value: string, options: any = {}): any {
		//debugger
		console.log("isLoaded: ", this.get('isLoaded'));
		console.log("jezyk: ", i18n.lng())
		console.log("i18n.t(value,...", i18n.t(value))
		return i18n.t(value, options)
	},

	translateStrings: function() {
		console.log("funkcja translateStrings na jezyk", i18n.lng())
		Object.keys(this.translations).forEach((key: string) => {
			this.set('translations.' + key, this.t(key, {count: this.get('commentsCount')}));
		});
		console.log("this.translations", this.translations)
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
			}
		);

		this._super();
	}
});
