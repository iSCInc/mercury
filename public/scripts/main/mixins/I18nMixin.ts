/// <reference path="../app.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

App.I18nMixin = Em.Mixin.create({
	isLoaded: {},
	i18nInited: false,

	t: function(value: string, options: any): any {
		console.log("isLoaded: ", this.get('isLoaded'));
		console.log("i18n.lng()", i18n.lng());
		console.log("i18n.t(value,...", i18n.t(value, {count: this.get('count')})) //tu wartosc jest poprawna
		return function () { 
			return i18n.t(value, {count: this.get('count')})
		}.property('isLoaded', 'count', 'lol')

		
	},

	initI18n: function (): any {
		console.log("init i18n funkcja")
		i18n.init({
			resGetPath: '/public/locales/__lng__/translation.json',
			detectLngQS: 'uselang',
			lng: 'en', //zmien
			fallbackLng: 'en',
			debug: true,
			useLocalStorage: false
			}, () => {
				this.set('i18nInited', true);
				this.set('isLoaded.'+'en', true); //zmien
			}
		);
	},

	translateStrings: function() {
		console.log("funkcja translateStrings na jezyk", i18n.lng())
		if (this.translations.length) { 
				this.set('translations',
					this.translations.map(
						(tr) => {
							Em.defineProperty(this, tr, this.t(tr));
					})
				);
				this.set('isLoaded.'+i18n.lng(), true );
		}
	}.observes('i18nInited', 'isLoaded'),

	init: function (): any { //wykonuje sie tylko raz- na starcie
		console.log('dsf'); 

		if (!this.get('i18nInited')) {
			this.initI18n();
		}

		this._super();
	}
});
