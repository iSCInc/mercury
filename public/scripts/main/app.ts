/// <reference path="../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../typings/ember/ember.d.ts" />
/// <reference path="../../../typings/i18next/i18next.d.ts" />
/// <reference path="../baseline/mercury.d.ts" />
/// <reference path="../mercury/utils/track.ts" />

'use strict';

declare var i18n: I18nextStatic;

var App: any = Em.Application.create({
		language: Em.getWithDefault(Mercury, 'wiki.language.user', 'en'),
		apiBase: Mercury.apiBase || '/api/v1'
	});

App.initializer({
	name: 'preload',
	initialize: (container: any, application: any) => {
		
		var debug: boolean = Mercury.environment === 'dev';

		// turn on debugging with querystring ?debug=1
		if (window.location.search.match(/debug=1/)) {
			debug = true;
		}

		App.setProperties({
			LOG_ACTIVE_GENERATION: debug,
			LOG_VIEW_LOOKUPS: debug,
			LOG_TRANSITIONS: debug,
			LOG_TRANSITIONS_INTERNAL: debug
		});

		$('html').removeClass('preload');
	}
});
