/// <reference path="../app.ts" />
/// <reference path="./LightboxView.ts" />
/// <reference path="../mixins/I18nMixin.ts" />
'use strict';

App.MapLightboxView = App.LightboxView.extend(App.I18nMixin, {
	classNames: ['map-lightbox'],
	status: 'opening',

	translations: {
		'map-lightbox-error': null
	},

	didInsertElement: function (): void {
		this.set('status', 'open');

		this._super();
	},

	willDestroyElement: function (): void {
		this.get('controller').reset();

		this._super();
	}
});
