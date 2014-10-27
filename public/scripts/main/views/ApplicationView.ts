/// <reference path="../app.ts" />
'use strict';

// TS built-in MouseEvent's target is an EventTarget, not an HTMLElement
interface HTMLMouseEvent extends MouseEvent {
	target: HTMLElement;
}

interface DOMStringMap {
	galleryRef: string;
	ref: string;
}

interface EventTarget {
	tagName: string;
}

App.ApplicationView = Em.View.extend({
	/**
	 * Store scroll location so when we set the body to fixed position, we can set its
	 * top, and also so we can scroll back to where it was before we fixed it.
	 * @type int
	 */
	scrollLocation: null,

	willInsertElement: function (): void {
		$('#article-preload').remove();
	},

	/**
	 * Necessary because presently, we open external links in new pages, so if we didn't
	 * cancel the click event on the current page, then the mouseUp handler would open
	 * the external link in a new page _and_ the current page would be set to that external link.
	 */
	click: function (event: MouseEvent): void {
		event.preventDefault();
	},

	handleLink: function (target: HTMLAnchorElement): void {
		var matches: Array<string>;

		Em.Logger.debug('Handling link with href:', target.href);

		/**
		 * If either the target or the target's parent is an anchor (and thus target == true).
		 * If it doesn't we assume there is some other handler for it that deals with it based on ID or something
		 * and we just skip it.
		 */
		if (target && target.href) {
			/**
			 * But if it does have an href, we check that it's not the link to expand the comments
			 * If it's _any_ other link than that comments link, we stop its action and
			 * pass it up to handleLink
			 */
			if (!target.href.match('^' + window.location.origin + '\/a\/.*\/comments$')) {
				event.preventDefault();
				this.get('controller').send('handleLink', target);
			}
		}
	},

	handleMedia: function (target: HTMLElement): void {
		var galleryRef = $(target).closest('[data-gallery-ref]').data('gallery-ref'),
			mediaRef = $(target).closest('[data-ref]').data('ref');

		if (mediaRef >= 0) {
			Em.Logger.debug('Handling media:', mediaRef, 'gallery:', galleryRef);

			this.get('controller').send('openLightbox', 'media-lightbox', {
				mediaRef: mediaRef,
				galleryRef: galleryRef,
				target: target
			});

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

	hammerOptions: {
		touchAction: 'auto'
	},

	gestures: {
		tap: function (event: Event): void {
			/**
			 * check if the target has a parent that is an anchor
			 * We do this for links in the form <a href="...">Blah <i>Blah</i> Blah</a>,
			 * because if the user clicks the part of the link in the <i></i> then
			 * target.tagName will register as 'I' and not 'A'.
			 */
			var $closest =  Em.$(event.target).closest('a'),
				target: EventTarget = $closest.length ? $closest[0] : event.target;

			if (target) {
				switch (target.tagName.toLowerCase()) {
					case 'a':
						this.handleLink(target);
						break;
					case 'img':
					case 'figure':
						this.handleMedia(target);
						break;
				}
			}
		}
	},

	actions: {
		setScrollable: function (): void {
			Em.$('body')
				.removeClass('no-scroll')
				.css('top', '');

			window.scrollTo(0, this.get('scrollLocation'));
			this.set('scrollLocation', null);
		},

		setUnscrollable: function (): void {
			var $body = Em.$('body'),
				scrollLocation = $body.scrollTop();

			this.set('scrollLocation', scrollLocation);

			$body.css('top', -scrollLocation)
				.addClass('no-scroll');
		}
	}
});
