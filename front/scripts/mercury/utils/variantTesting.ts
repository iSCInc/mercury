/// <reference path="../../baseline/mercury.d.ts" />

/**
 * @define variantTesting
 *
 * Helper for variant testing using Optimizely
 */
'use strict';

interface Window {
	optimizely?: any;
}

module Mercury.Utils.VariantTesting {
	/**
	 * Activates all variant tests for the current page
	 *
	 * @returns {void}
	 */
	export function activate (): void {
		var optimizely = window.optimizely;
		if (optimizely) {
			optimizely.push(['activate']);
		}
	}

	/**
	 * Tracks an event by name
	 *
	 * @param {string} eventName
	 * @returns {void}
	 */
	export function trackEvent (eventName: string): void {
		var optimizely = window.optimizely;
		if (optimizely) {
			optimizely.push(['trackEvent', eventName]);
		}
	}
}

