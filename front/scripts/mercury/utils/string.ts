/// <reference path="../../baseline/mercury.d.ts" />
'use strict';

module Mercury.Utils.String {
	/**
	 * We need to support links like:
	 * /wiki/Rachel Berry
	 * /wiki/Rachel  Berry
	 * /wiki/Rachel__Berry
	 *
	 * but we want them to be displayed normalized in URL bar
	 */
	export function sanitize (title: string = '') {
		return decodeURIComponent(title)
			.replace(/\s/g, '_')
			.replace(/_+/g, '_');
	}

	export function normalize (title: string = '') {
		return decodeURIComponent(title)
			.replace(/_/g, ' ')
			.replace(/\s+/g, ' ');
	}
}
