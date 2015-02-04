/// <reference path="../../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../baseline/mercury.d.ts" />

'use strict';

interface Window {
	gaTrackAdEvent: any
}

module Mercury.Modules {

	export class Ads {
		private static instance: Mercury.Modules.Ads = null;
		private adSlots: string[] = [];
		private adsContext: any = null;
		private adEngineModule: any;
		private adContextModule: any;
		private adConfigMobile: any;
		private isLoaded = false;

		/**
		 * Returns instance of Ads object
		 * @returns {Mercury.Modules.Ads}
		 */
		public static getInstance (): Mercury.Modules.Ads {
			if (Ads.instance === null) {
				Ads.instance = new Mercury.Modules.Ads();
			}
			return Ads.instance;
		}

		/**
		 * Initializes the Ad module
		 *
		 * @param adsUrl Url for the ads script
		 * @param callback Callback function to execute when the script is loaded
		 */
		public init (adsUrl: string, callback: () => void) {
			//Required by ads tracking code
			window.gaTrackAdEvent = this.gaTrackAdEvent;
			// Load the ads code from MW
			M.load(adsUrl, () => {
				if (require) {
					require([
						'ext.wikia.adEngine.adEngine',
						'ext.wikia.adEngine.adContext',
						'ext.wikia.adEngine.adConfigMobile'
					], (adEngineModule: any, adContextModule: any, adConfigMobile: any) => {
						this.adEngineModule = adEngineModule;
						this.adContextModule = adContextModule;
						this.adConfigMobile = adConfigMobile;
						this.isLoaded = true;

						this.adEngineModule.run(this.adConfigMobile, this.adSlots, 'queue.mercury');

						callback.call(this);
					});
				} else {
					Em.Logger.error('Looks like ads asset has not been loaded');
				}
			});
		}

		/**
		 * Method for sampling and pushing ads-related events
		 * @arguments coming from ads tracking request
		 * It's called by track() method in wikia.tracker fetched from app by ads code
		 */
		public gaTrackAdEvent (): void {
			var args: any,
				//Percentage of all the track requests to go through
				adHitSample: number = 1,
				GATracker: Mercury.Modules.Trackers.GoogleAnalytics;
			//Sampling on GA side will kill the performance as we need to allocate object each time we track
			//ToDo: Optimize object allocation for tracking all events
			if (Math.random() * 100 <= adHitSample) {
				args = Array.prototype.slice.call(arguments);
				args.unshift('ads._trackEvent');
				GATracker = new Mercury.Modules.Trackers.GoogleAnalytics();
				GATracker.trackAds.apply(GATracker, args);
			}
		}

		/**
		 * Reloads the ads with the provided adsContext
		 * @param adsContext
		 */
		public setContext (adsContext: any) {
			// Store the context for external reuse
			this.adsContext = adsContext ? adsContext : null;

			if (this.isLoaded && adsContext) {
				this.adContextModule.setContext(adsContext);
			}
		}

		/**
		 * Adds ad slot
		 *
		 * @param name name of the slot
		 * @returns {number} index of the inserted slot
		 */
		public addSlot (name: string): number {
			return this.adSlots.push(name);
		}

		/**
		 * Retrieves the ads context
		 *
		 * @returns {Object|null}
		 */
		getContext (): any {
			return this.adsContext;
		}
	}
}
