/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

App.I18nMixin = Em.Mixin.create({
	readyToTranslate: false,

	changeLng: function() {
		var lng = this.get('controller.uselang');
		i18n.setLng(lng, () => {
			this.notifyPropertyChange('readyToTranslate');
		});
	}.observes('controller.uselang'),

	translate: function() {
		Object.keys(this.translations).forEach((key: string) => {
			var getCurrent = this.get('translations.' + key)
			if (getCurrent.options) {
				this.set('translations.' + key + '.value', i18n.t(key, getCurrent.options));
				//retun computed proprty bo sie musi updateowac
			} else {
				this.set('translations.' + key, i18n.t(key));
			}
		});
		console.log("this.translations: ", this.translations)
	}.observes('readyToTranslate'),

	init: function (): any {
		i18n.init({
			resGetPath: '/public/locales/__lng__/translation.json',
			detectLngQS: 'uselang',
			fallbackLng: App.get('language'),
			debug: true,
			useLocalStorage: false
		});

		this._super();
	}
});
