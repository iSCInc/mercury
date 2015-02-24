/// <reference path="./BaseTracker.ts" />
/// <reference path="../../../../vendor/weppy/weppy.d.ts" />
'use strict';

interface PerfTrackerParams {
	type: string;
	context?: any;
	module?: string;
	name: string;
	value: number;
	annotations?: any;
}

module Mercury.Modules.Trackers {
	export class Perf extends BaseTracker {
		public static depsLoaded: boolean = typeof Weppy === 'function';
		tracker: any;
		defaultContext: {
			skin: string;
			'user-agent': string;
		}

		constructor () {
			this.tracker = Weppy.namespace('mercury');
			this.defaultContext = {
				skin: 'mercury',
				'user-agent': window.navigator.userAgent,
			}
			this.tracker.setOptions({
				host: Mercury._state.weppyConfig.host,
				transport: 'url',
				context: this.defaultContext,
				sample: Mercury._state.weppyConfig.samplingRate,
				aggregationInterval: Mercury._state.weppyConfig.aggregationInterval
			});
			super();
		}

		track (params: PerfTrackerParams): void {
			var trackFn = this.tracker;

			if (typeof params.module === 'string') {
				trackFn = this.tracker.into(params.module);
			}

			if (params.context) {
				trackFn.setOptions({
					context: $.extend(params.context, this.defaultContext)
				});
			}

			switch (params.type) {
				case 'count':
					trackFn.count(params.name, params.value, params.annotations);
					break;
				case 'store':
					trackFn.store(params.name, params.value, params.annotations);
					break;
				case 'timer':
					trackFn.timer.send(params.name, params.value, params.annotations);
					break;
				case undefined:
					throw 'You failed to specify a tracker type.'
					break;
				default:
					throw 'This action not supported in Weppy tracker';
			}
		}
	}
}