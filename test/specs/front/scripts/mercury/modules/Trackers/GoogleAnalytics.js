/* global Mercury, _gaq */
QUnit.module('GoogleAnalytics tests', {
	setup: function () {

		M.props({
			tracking: {
				ga: {
					primary: {
						id: '123',
						sampleRate: 10
					},
					ads: {
						prefix: 'ads',
						id: '789',
						sampleRate: 100
					}
				}
			}
		// instantiate with mutation because tests are run multiple times
		}, true);
		// Mock GA queue
		var queue = [];
		window._gaq = {
			push: function (commandArray) {
				queue.push(commandArray);
			}
		};
		this.queue = queue;

		/**
		 * Checks how many times a command appears in the queue
		 */
		this.queueCount = function (command) {
			var count = 0,
				i = 0;
			for (; i < this.queue.length; i++) {
				if (this.queue[i][0] === command) {
					count++;
				}
			}
			return count;
		};

		/**
		 * Checks if a specific command array appears in the queue
		 */
		this.queueContains = function (commandArray) {
			var i, j, contains;

			for (i = 0; i < this.queue.length; i++) {
				if (contains === true) {
					return true;
				}
				contains = true;
				for (j = 0; j < this.queue[i][j]; j++) {
					if (this.queue[i][j] !== commandArray[j]) {
						contains = false;
						break;
					}
				}
			}
			return false;
		};
	}
});

QUnit.test('GoogleAnalytics is compiled into Mercury.Modules.Trackers namespace', function () {
	ok(Mercury.Modules.Trackers.GoogleAnalytics);
	strictEqual(typeof Mercury.Modules.Trackers.GoogleAnalytics, 'function');
});

QUnit.test('GoogleAnalytics constructor', function () {
	new Mercury.Modules.Trackers.GoogleAnalytics();

	strictEqual(this.queueCount('_setAccount'), 1);
	strictEqual(this.queueCount('special._setAccount'), 0);
	strictEqual(this.queueCount('_setSampleRate'), 0);
	strictEqual(this.queueCount('special._setSampleRate'), 0);

	deepEqual(['_setAccount', '123'], this.queue[0]);
	deepEqual(['ads._setAccount', '789'], this.queue[1]);
});

QUnit.test('Track event', function () {
	var tracker = new Mercury.Modules.Trackers.GoogleAnalytics();
	tracker.track('category', 'action', 'label', 42, true);
	deepEqual(this.queueContains(['_trackEvent', 'category', 'action', 'label', 42, true]), true);
	deepEqual(this.queueContains(['special._trackEvent', 'category', 'action', 'label', 42, true]), true);
});

QUnit.test('Track page view', function () {
	var tracker = new Mercury.Modules.Trackers.GoogleAnalytics();
	tracker.trackPageView();
	deepEqual(this.queueContains(['_trackPageView']), true);
	deepEqual(this.queueContains(['special._trackPageView']), true);
});

QUnit.test('Track ads-related event', function () {
	var tracker = new Mercury.Modules.Trackers.GoogleAnalytics();
	tracker.trackAds('testCategory', 'testAction', 'testLabel', 0, true);
	deepEqual(this.queueContains(['ads._trackEvent', 'testCategory', 'testAction', 'testLabel', 0, true]), true);
});
