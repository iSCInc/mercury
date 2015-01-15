/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

App.I18nMixin = Em.Mixin.create({
	isLoaded: {},
	i18nInited: false,

	translate: function() {
		console.log("funkcja translate na jezyk", i18n.lng())

		Object.keys(this.translations).forEach((key: string) => {
			var getCurrent = this.get('translations.' + key)
			if (getCurrent.options) {
				this.set('translations.' + key + '.value', i18n.t(key, getCurrent.options));
			} else {
				this.set('translations.' + key, i18n.t(key));
			}
		});
		console.log("this.translations", this.translations)
	}.observes('i18nInited', 'isLoaded'),

	init: function (): any { //fires only once- at init
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
