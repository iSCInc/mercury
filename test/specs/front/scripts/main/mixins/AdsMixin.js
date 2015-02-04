'use strict';

QUnit.module('AdsMixin');

QUnit.test('has its data', function () {
	this.stub(Mercury.Modules.Ads, 'getInstance', function (){});

	var instance = Em.Object.createWithMixins(App.AdsMixin, {});

	ok(instance.adsData);
});

QUnit.test('appendAd', function () {
	var instance = Em.Object.createWithMixins(App.AdsMixin, {}),
		elementStub = this.stub({
			before: function () {}
		}),
		triggerSpy = this.spy(),
		createElementSpy = this.spy(function () {
			return {
				$: function () {
					return ''
				},
				trigger: triggerSpy
			}
		});

	instance.createChildView = this.spy(function () {
		return {
			createElement: createElementSpy
		}
	});

	instance.appendAd('test', 'before', elementStub);

	ok(instance.createChildView.called);
	ok(createElementSpy.called);
	ok(triggerSpy.calledWith('didInsertElement'), 'called with didInsertElement');
});
