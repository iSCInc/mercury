moduleFor('controller:lightbox', 'Lightbox Controller');

test('if toggleFooter method toggles lightboxFooterExpanded property', function () {
	expect(3);
	var lightboxController = this.subject();

	equal(lightboxController.get('lightboxFooterExpanded'), null);

	lightboxController.send('toggleFooter');

	equal(lightboxController.get('lightboxFooterExpanded'), true);

	lightboxController.send('toggleFooter');

	equal(lightboxController.get('lightboxFooterExpanded'), false);
});

test('if toggleUI method properly toggles footerHidden and headerHidden properties', function () {
	expect(6);
	var lightboxController = this.subject();

	equal(lightboxController.get('footerHidden'), null);
	equal(lightboxController.get('headerHidden'), null);

	lightboxController.send('toggleUI');

	equal(lightboxController.get('footerHidden'), true);
	equal(lightboxController.get('headerHidden'), true);

	lightboxController.send('toggleUI');

	equal(lightboxController.get('footerHidden'), false);
	equal(lightboxController.get('headerHidden'), false);
});