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
  var filepath = __dirname + '/fixtures/players.json';
	var Players;
	
	beforeEach(function( done ) {
    rm_rf( filepath, function (err) {
      if ( err ) throw err;

      Players = Collection({ name: 'players', dataDir: __dirname + '/fixtures' });
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

    it( 'returns a promise', function() {
      assert.equal( typeof Players.persist().then, 'function' );
    });

    it( 'creates the right json file', function( done ) {
      // namely, it should create ./fixtures/players.json

      Players.persist()
        .then( function() {
          fs.exists( filepath, function(exists) {
            assert( exists );
            done();
          });
        });
    });

    it( 'saves correct json to the file', function( done ) {
      var player = { number: 18, name: 'Peyton Manning', team: 'Colts' };

      Players.add(player);

      Players.persist()
        .then(function() {
          fs.readFile( filepath, { encoding: 'utf-8' }, function( err, contents ) {
            if ( err ) throw err;

            var json = JSON.parse( contents );

            assert( json[0].name, player.name );
            done();
          });
        });
    });
	});

	describe( '#toJSON()', function() {
    it( 'returns an array of objects', function() {
      var result;
      var obj;

      Players.add({ id: 33 });

      result = Players.toJSON();

      assert( result[0].id, 33 );
    });
	});

	describe( '#toArray()', function() {
    it( 'returns an array of models', function() {
      var result;

      Players.add({ id: 2 });

      result = Players.toArray();

      assert( typeof result[0].set, 'function' );
      assert( typeof result[0].save, 'function' );
    });
	});
});