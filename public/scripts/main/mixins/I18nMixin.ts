/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

App.I18nMixin = Em.Mixin.create({
	//this param is used to trigger translate() function when language changed
	readyToTranslate: false,

	changeLanguage: function(): void {
		var lng = this.get('controller.uselang');
		i18n.setLng(lng, () => {
			this.notifyPropertyChange('readyToTranslate');
		});
	}.observes('controller.uselang'),

	translate: function(): void {
		Object.keys(this.translations).forEach((translationKey: string) => {
			var translationParams = this.translations[translationKey] || {},
				computedProperty = [
				'readyToTranslate',
				() => {
					var paramsHash: { [index: string]: any } = {};
					Object.keys(translationParams).forEach((paramKey: string) => {
						paramsHash[paramKey] = this.get(translationParams[paramKey]);
					});
					return i18n.t(translationKey, paramsHash);
				}
			];

			Object.keys(translationParams).forEach((paramKey: string) => {
				computedProperty.unshift(translationParams[paramKey]); 
			});

			Ember.defineProperty(this, 'T-' + translationKey, 
				Ember.computed.apply(this, computedProperty)
			);

			//notifyPropertyChange is necessary because we have to inform all other components
			//about change ( we don't use this.set() )
			this.notifyPropertyChange('T-' + translationKey)
		});
	}.observes('readyToTranslate'),

	init: function (): void {
		this._super();

		i18n.init({
			resGetPath: '/public/locales/__lng__/translation.json',
			detectLngQS: 'uselang',
			fallbackLng: App.get('language'),
			debug: true,
			useLocalStorage: false
		});
	}
});
