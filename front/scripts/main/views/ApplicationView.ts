/// <reference path='../app.ts' />
/// <reference path="../../mercury/utils/browser.ts" />
/// <reference path='../../../../typings/headroom/headroom.d.ts' />
'use strict';

// TS built-in MouseEvent's target is an EventTarget, not an HTMLElement
interface HTMLMouseEvent extends MouseEvent {
	target: HTMLElement;
}

interface DOMStringMap {
	galleryRef: string;
	ref: string;
	trackingCategory: string;
}

interface EventTarget {
	tagName: string;
}

App.ApplicationView = Em.View.extend({
	classNameBindings: ['systemClass', 'smartBannerVisible', 'verticalClass'],

	verticalClass: function (): string {
		var vertical: string = Em.get(Mercury, 'wiki.vertical');
		return vertical + '-vertical';
	}.property(),

	systemClass: function (): string {
		var system: string = Mercury.Utils.Browser.getSystem();
		return system ? 'system-' + system : '';
	}.property(),

	smartBannerVisible: Em.computed.alias('controller.smartBannerVisible'),
	sideNavCollapsed: Em.computed.alias('controller.sideNavCollapsed'),
	noScroll: Em.computed.alias('controller.noScroll'),
	scrollLocation: null,

	willInsertElement: function (): void {
		$('#article-preload').remove();
	},

	handleLink: function (target: HTMLAnchorElement): void {
		var controller: typeof App.ApplicationController;

		Em.Logger.debug('Handling link with href:', target.href);

		/**
		 * If either the target or the target's parent is an anchor (and thus target == true),
		 * then also check if the anchor has an href. If it doesn't we assume there is some other
		 * handler for it that deals with it based on ID or something and we just skip it.
		 */
		if (target && target.href) {
			/**
			 * But if it does have an href, we check that it's not the link to expand the comments
			 * If it's _any_ other link than that comments link, we stop its action and
			 * pass it up to handleLink
			 */
			if (!target.href.match('^' + window.location.origin + '\/a\/.*\/comments$')) {
				controller = this.get('controller');

				controller.send('closeLightbox');
				controller.send('handleLink', target);
			}
		}
	},

	handleMedia: function (target: HTMLElement): void {
		var $target = $(target),
			galleryRef = $target.closest('[data-gallery-ref]').data('gallery-ref'),
			$mediaElement = $target.closest('[data-ref]'),
			mediaRef = $mediaElement.data('ref');

		if (mediaRef >= 0) {
			Em.Logger.debug('Handling media:', mediaRef, 'gallery:', galleryRef);

			if (!$mediaElement.hasClass('is-small')) {
				this.get('controller').send('openLightbox', 'media-lightbox', {
					mediaRef: mediaRef,
					galleryRef: galleryRef,
					target: target
				});
			} else {
				Em.Logger.debug('Image too small to open in lightbox', target);
			}

			if (galleryRef >= 0) {
				M.track({
					action: M.trackActions.click,
					category: 'gallery'
				});
			}
		} else {
			Em.Logger.debug('Missing ref on', target);
		}
	},

	/**
	 * Necessary because presently, we open external links in new pages, so if we didn't
	 * cancel the click event on the current page, then the mouseUp handler would open
	 * the external link in a new page _and_ the current page would be set to that external link.
	 */
	click: function (event: MouseEvent): void {
		/**
		 * check if the target has a parent that is an anchor
		 * We do this for links in the form <a href='...'>Blah <i>Blah</i> Blah</a>,
		 * because if the user clicks the part of the link in the <i></i> then
		 * target.tagName will register as 'I' and not 'A'.
		 */
		var $closest = Em.$(event.target).closest('a'),
			target: EventTarget = $closest.length ? $closest[0] : event.target,
			tagName: string;

		if (target) {
			tagName = target.tagName.toLowerCase();

			if (tagName === 'a') {
				this.handleLink(<HTMLAnchorElement>target);
				event.preventDefault();
			} else if (this.shouldHandleMedia(target, tagName)) {
				this.handleMedia(<HTMLElement>target);
				event.preventDefault();
			}
		}
	},

	/**
	 * @desc Returns true if handleMedia() should be executed
	 * @param {EventTarget} target
	 * @param {string} tagName clicked tag name
	 * @returns {boolean}
	 */
	shouldHandleMedia: function(target: EventTarget, tagName: string): boolean {
		return tagName === 'img' || tagName === 'figure'
			&& $(target).children('a').length === 0;
	},

	sideNavCollapsedObserver: function (): void {
		if (this.get('sideNavCollapsed')) {
			this.set('noScroll', false);
		} else {
			this.set('noScroll', true);
		}
	}.observes('sideNavCollapsed'),

	noScrollObserver: function (): void {
		var $body = Em.$('body'),
			scrollLocation: number;

		if (this.get('noScroll')) {
			scrollLocation = $body.scrollTop();

			this.set('scrollLocation', scrollLocation);

			$body.css('top', -scrollLocation)
				.addClass('no-scroll');
		} else {
			$body.removeClass('no-scroll')
				.css('top', '');

			window.scrollTo(0, this.get('scrollLocation'));
			this.set('scrollLocation', null);
		}
	}.observes('noScroll')
});
