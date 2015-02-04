QUnit.module('Ads tests');

QUnit.test('Returns ads instance', function () {
	ok(Mercury.Modules.Ads);
	equal(typeof Mercury.Modules.Ads.getInstance(), 'object');
});

QUnit.test('Init method works', function() {
	var calledURL,
		callbackIsCalled = false,
		testUrl = 'http://example.com/',
		instance = new Mercury.Modules.Ads(),
		runSpy = this.spy(),
		requiredModules;

	require = function(modules, callback) {
		requiredModules = modules;
		callback({run: runSpy}, modules[1], modules[2]);
	};

	this.stub(M, 'load', function(url, callback) {
		calledURL = url;
		callback();
	});

	instance.init(testUrl, function () {
		callbackIsCalled = true;
	});

	delete(require);

	ok(runSpy.calledWithExactly(requiredModules[2], [], 'queue.mercury'), 'run called with correct args');
	equal(calledURL, testUrl);
	equal(callbackIsCalled, true);
});

QUnit.test('setContext ads works', function () {
	var adEngineRun = false,
		testContext = {
			test: 1
		},
		setContextSpy = this.spy(),
		instance = new Mercury.Modules.Ads();

	instance.adContextModule = {
		setContext: setContextSpy
	};

	instance.isLoaded = true;

	instance.setContext(testContext);

	ok(setContextSpy.calledWith(testContext));
	expect(instance.adsContext, testContext);
});

QUnit.test('Add/remove slots works', function () {
	var instance = new Mercury.Modules.Ads();

	equal(instance.adSlots.length, 0);
	instance.addSlot('test1');
	equal(instance.adSlots.length, 1);

	instance.setContext(null);
});
