/// <reference path="../app.ts" />
/// <reference path="../../baseline/mercury.d.ts" />
/// <reference path="../../mercury/modules/Ads.ts" />

'use strict';

App.AdSlotComponent = Em.Component.extend({
	classNames: ['ad-slot-wrapper'],
	classNameBindings: ['nameLowerCase'],
	//This component is created dynamically, and this won't work without it
	layoutName: 'components/ad-slot',

	name: null,
	// noAds is being passed from ApplicationController where it's also casted to a string
	noAds: '',

	nameLowerCase: function () {
		return this.get('name').toLowerCase().dasherize();
	}.property('name'),

	didInsertElement: function () {
		var noAds = this.get('noAds');

		if (noAds === '' || noAds === '0') {
			Em.Logger.info('Injected ad:', this.get('name'));
			Mercury.Modules.Ads.getInstance().addSlot(this.get('name'));
		} else {
			Em.Logger.info('Ad disabled for:', this.get('name'));
		}
	}
});
