/// <reference path="../app.ts" />
/// <reference path="../../mercury/modules/Ads.ts" />
/// <reference path="../../../../typings/jquery/jquery.d.ts" />
'use strict';

/**
 * Mixin that is used by ArticleView
 * and handles injecting Ads
 */
App.AdsMixin = Em.Mixin.create({
	adsData: {
		minZerothSectionLength: 700,
		minPageLength: 2000,
		mobileInContent: 'MOBILE_IN_CONTENT',
		mobilePreFooter: 'MOBILE_PREFOOTER',
		mobileTopLeaderboard: 'MOBILE_TOP_LEADERBOARD'
	},
	adViews: <Em.View[]>[],
	ads: Mercury.Modules.Ads.getInstance(),

	appendAd: function (adSlotName: string, place: string, element: JQuery): void {
		// Keep in mind we always want to pass noAds parameter to the AdSlot component
		// Right now we've got three ad slots and it doesn't make sense to add assertion
		// in willInsertElement hook of the component to check if the parameters is really defined
		var view = this.createChildView(App.AdSlotComponent, {
			name: adSlotName,
			noAds: this.get('controller.noAds')
		}).createElement();

		element[place](view.$());
		this.adViews.push(view);

		view.trigger('didInsertElement');
	},

	clearAdViews: function() {
		var adView: Em.View;

		while (adView = this.adViews.pop()) {
			adView.destroyElement();
		}
	},

	/**
	 * This is called outside from ArticleView
	 * To keep api consistent outside this method gets overridden
	 * with this.injectAds
	 *
	 * @param adsContext
	 */
	handleAds: function (adsContext: any) {
		// Setup ads
		if (Mercury.adsUrl && !Em.get(Mercury, 'query.noExternals')) {
			this.ads.init(Mercury.adsUrl, () => {
				this.handleAds = this.injectAds;
				this.injectAds(adsContext);
			});
		}
	},

	/**
	 * Handles injecting various ad slots
	 *
	 * @param adsContext
	 */
	injectAds: function (adsContext: any): void {
		var $firstSection = this.$('h2').first(),
			$articleBody = this.$('.article-body'),
			$pageWrapper = $('.page-wrapper'),
			firstSectionTop = ($firstSection.length && $firstSection.offset().top) || 0,
			showInContent = firstSectionTop > this.adsData.minZerothSectionLength,
			showPreFooter = $articleBody.height() > this.adsData.minPageLength || firstSectionTop < this.adsData.minZerothSectionLength;

		this.ads.setContext(adsContext);

		this.clearAdViews();

		this.appendAd(this.adsData.mobileTopLeaderboard, 'before', $pageWrapper);

		if (showInContent) {
			this.appendAd(this.adsData.mobileInContent, 'before', $firstSection);
		}

		if (showPreFooter) {
			this.appendAd(this.adsData.mobilePreFooter, 'after', $articleBody);
		}
	}
});
