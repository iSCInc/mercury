/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

App.I18nMixin = Em.Mixin.create({
	i18nInited: false,

	translate: function() {
		Object.keys(this.translations).forEach((key: string) => {
			var getCurrent = this.get('translations.' + key)
			if (getCurrent.options) {
				this.set('translations.' + key + '.value', i18n.t(key, getCurrent.options));
			} else {
				this.set('translations.' + key, i18n.t(key));
			}
		});
		console.log("this.translations", this.translations)
	}.observes('i18nInited', 'controller.uselang'),

	init: function (): any { //fires only once- at init
		console.log("this.get('controller.uselang') : ", this.get('controller.uselang'));
		i18n.init({
			resGetPath: '/public/locales/__lng__/translation.json',
			detectLngQS: 'uselang',
			fallbackLng: App.get('language'),
			debug: true,
			useLocalStorage: false
			}, () => {
				this.set('i18nInited', true);
			}
		);

		this._super();
	}
});
