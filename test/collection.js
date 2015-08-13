var fs = require( 'fs' );
var path = require( 'path' );
var assert = require( 'assert' );
var Collection = require( '../src/collection' );

describe( 'Collection constructor', function() {
	it( 'throws unless given a config object with a string `name` key', function() {
		assert.throws(function() {
			Collection('users');
		});

		assert.throws(function() {
			Collection([]);
		});

		assert.throws(function() {
			Collection({});
		});

		assert.doesNotThrow(function() {
			Collection({ name: '' });
		});
	});

	describe( 'when file already exists', function() {
		it( 'loads the data from that JSON file', function() {
			var Users = Collection({ name: 'users', dataDir: __dirname + '/fixtures' });
			assert.equal( Users.toArray().length, 3 );
		});
	});
});


describe( 'Collection instance', function() {
	var Players;
	
	beforeEach(function() {
		Players = Collection({ name: 'players', dataDir: './fixtures' });
	});

	describe( '#add()', function() {

	});

	describe( '#find()', function() {

	});

	describe( '#findOne()', function() {

	});

	describe( '#remove()', function() {

	});

	describe( '#persist()', function() {

	});

	describe( '#toJSON()', function() {

	});

	describe( '#toArray()', function() {

	});
});