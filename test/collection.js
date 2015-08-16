var fs = require( 'fs' );
var path = require( 'path' );
var assert = require( 'assert' );
var rm_rf = require( 'rimraf' );
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

  afterEach(function( done ) {
    rm_rf( './fixtures/players.json', function (err) {
      if ( err ) console.error( err );
      done();
    });
  });

  describe( '#size()', function() {
    it( 'returns zero when the collection is empty', function() {
      assert.equal( Players.size(), 0 );
    });
  })

	describe( '#add(item)', function() {
    var player = { number: 12, name: 'Tom Brady', team: 'Patriots' };

    it( 'adds the given item to the collection', function() {
      var item;
      Players.add( player );

      assert.deepEqual( Players.toJSON()[0], player );
    });

    it( 'increases the the size of the collection by one', function() {
      assert.equal( Players.size(), 0 );
      Players.add( player );
      assert.equal( Players.size(), 1 );
    });
	});

	describe( '#find(query)', function() {

	});

	describe( '#findOne(query)', function() {

	});

	describe( '#remove(query)', function() {

	});

	describe( '#persist()', function() {

	});

	describe( '#toJSON()', function() {

	});

	describe( '#toArray()', function() {

	});
});