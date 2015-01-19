/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

App.I18nMixin = Em.Mixin.create({
	readyToTranslate: false,

	changeLng: function(): void {
		var lng = this.get('controller.uselang');
		i18n.setLng(lng, () => {
			this.notifyPropertyChange('readyToTranslate');
		});
	}.observes('controller.uselang'),

	translate: function(): any {
		console.log('------------------', this)
		Object.keys(this.translations).forEach((key: string) => {
			var getCurrent = this.get('translations.' + key)
			if ( typeof getCurrent == 'string') {
				this.set(key, i18n.t(key));
			} else {
				console.log("NIE jestem stringiem - jestem obiektem: ", getCurrent)
				//this.set('translations.' + key + '.value', i18n.t(key, getCurrent.options));
				Ember.defineProperty(this, key, 
					Ember.computed('commentsCount', 'readyToTranslate', function() {
						return i18n.t(key, {count: this.get('commentsCount')});
					}));
				console.log(key, this.get( key))
			}
		});
		console.log("this.translations: ", this.translations)
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
