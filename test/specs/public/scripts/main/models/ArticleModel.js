/* global App, resetWikiaBaseline */
moduleFor('model:article', 'Article Model', {
	setup: function () {
		// Test data for later tests
		var exampleArticleID = 123;
		this.example = Ember.Object.create({
				details: {
					revision: {
						timestamp: 123
					},
					comments: 123,
					id: exampleArticleID,
					ns: 'namespace',
					title: 'sample title'
				},
				article: {
					content: 'Test content'
				},
				relatedPages: ['an item', 'another item'],
				userDetails: ['some item', 'yet one more']
			});

		this.wikiExample = {
			siteName: 'test'
		};

		// Preload data into Wikia.article
		Wikia.article = this.example;
		Wikia.wiki = this.wikiExample;
	},
	teardown: function () {
		App.reset();
		resetWikiaBaseline();
	}
});

test('ArticleModel RESTful URL tests', function () {
	var tests = [{
		title: ''
	}, {
		title: 'bar'
	}, {
		title: 'hippopotamus'
	}];
	expect(tests.length);
	tests.forEach(function (test) {
		var url = App.ArticleModel.url(test);
		var expected = '/api/v1/article/' + test.title;
		equal(url, expected, 'url returned"' + url + '", expected ' + expected);
	});
});

test('getPreloadedData', function () {
	expect(2);
	// Already run in wikiaBaseline and the startup callback:
	// Wikia._state.firstPage = true;
	// Wikia.article = this.example;
	var article = App.ArticleModel.getPreloadedData();
	strictEqual(Wikia._state.firstPage, false, 'Wikia object\'s firstPage state flipped to false');
	deepEqual(article, Wikia.article, 'article loaded from Wikia object on first page');
});

test('setArticle with preloaded data', function () {
	// Note: data preloaded in setup callback
	expect(11);
	var model = this.subject();
	App.ArticleModel.setArticle(model);
	// Necessary to set context
	verifyArticle(model, this.example, this.wikiExample);
});

test('setArticle with parametrized data', function () {
	expect(11);
	var model = this.subject();
	App.ArticleModel.setArticle(model, this.example);
	verifyArticle(model, this.example);
});

test('find with preloaded data', function () {
	var model, params;
	expect(13);

	params = {
		wiki: 'wiki',
		article: 'article'
	};

	ok(Wikia._state.firstPage, 'firstPage==true before test, as expected');
	Ember.run(function () {
		model = App.ArticleModel.find(params);
	});
	verifyArticle(model, this.example, this.wikiExample);
	ok(!Wikia._state.firstPage, 'firstPage==false after test, as expected');
});

/**
 * @desc Helper function for tests below which checks the validity of the data stored in the model
 * @param {model} The ArticleModel that data has been loaded into which should be tested
 * @param {example} The reference data
 */
function verifyArticle (model, example) {
	equal(model.get('type'),
		example.details.ns,
		'expected namespace=' + example.details.ns + ', got ' + model.get('type'));
	equal(model.get('cleanTitle'),
		example.details.title,
		'expected title=' + example.details.title + ', got ' + model.get('cleanTitle'));
	equal(model.get('comments'),
		example.details.comments,
		'correctly ingested comments');
	equal(model.get('id'),
		example.details.id,
		'expected article ID=' + example.details.id + ', got ' + model.get('id'));
	equal(model.get('article'),
		example.article.content,
		'expected sample content=' + example.article.content + ', got ' + model.get('article'));
	deepEqual(model.get('media'),
		example.article.media,
		'expected media=' + example.article.media + ', got ' + model.get('media'));
	equal(model.get('mediaUsers'),
		example.article.users,
		'expected mediaUsers=' + example.article.users + ', got ' + model.get('mediaUsers'));
	equal(model.get('user'),
		example.article.user,
		'expected user=' + example.article.user + ', got ' + model.get('user'));
	deepEqual(model.get('categories'),
		example.article.categories,
		'expected categories=' + example.article.categories + ', got ' + model.get('categories'));
	deepEqual(model.get('relatedPages'),
		example.relatedPages,
		'correction ingested related pages');
	deepEqual(model.users, example.details.items, 'correctly ingested user items');
}