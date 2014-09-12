/// <reference path="../app.ts" />
'use strict';

App.LightboxView = Em.View.extend({
	layoutName: 'app/lightbox',
	classNames: ['lightbox-wrapper'],
	classNameBindings: ['status'],
	attributeBindings: ['tabindex'],
	tabindex: 1,

	status: 'open',

	//this is needed if view wants to handle keyboard
	didInsertElement: function () {
		this.$().focus();
	},

	keyDown: function (event: KeyboardEvent) {
		if (event.keyCode === 27) {
			this.get('controller').send('closeLightbox');
		}
	},

	willDestroyElement: function () {
		this.get('controller').setProperties({
			lightboxFooterExpanded: false,
			footerHidden: false,
			headerHidden: false
		});
	}
});