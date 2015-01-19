/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

App.I18nMixin = Em.Mixin.create({
	needs: 'application',
	readyToTranslate: false,

	changeLng: function(): void {
		
		var lng = this.get('controller.uselang');
		i18n.setLng(lng, () => {
			this.notifyPropertyChange('readyToTranslate');
		});
	}.observes('controller.uselang'),

	translate: function(): any {
		Object.keys(this.translations).forEach((translationKey: string) => {
			var translationParams = this.translations[translationKey] || {};

				console.log("NIE jestem stringiem - jestem obiektem: ", translationKey, translationParams);

				var b = [
					'readyToTranslate',
					function() {
						var o = {};
						console.log("zmienilo sie commentsCount lub readyToTranslate");

						Object.keys(translationParams).forEach((paramKey: any) => {
							o[paramKey] = this.get(translationParams[paramKey]);

						});

						console.log("o: ", o);
						return i18n.t(translationKey, o);
					}
				];


				Object.keys(translationParams).forEach((paramKey: any) => {
					b.unshift(translationParams[paramKey]); 
				});


				Ember.defineProperty(this, translationKey, 
					Ember.computed.apply(this, b)
				);
				console.log(this.get(translationKey));
			
		});
	}.observes('readyToTranslate'),

	init: function (): any {
		this._super();

		i18n.init({
			resGetPath: '/public/locales/__lng__/translation.json',
			detectLngQS: 'uselang',
			fallbackLng: App.get('language'),
			debug: true,
			useLocalStorage: false
		},() => {
			this.notifyPropertyChange('readyToTranslate');
		});
	}
});
