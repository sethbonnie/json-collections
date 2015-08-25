var fs = require( 'fs' );
var assert = require( 'assert' );
var rmrf = require( 'rimraf' );
var Collection = require( '../src/collection' );

describe( 'Collection constructor', function() {
	it( 'throws when given a config object without "name" key', function() {
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
			var Users = Collection({ 
        name: 'users', 
        dataDir: __dirname + '/fixtures'
      });

			assert.equal( Users.toArray().length, 3 );
		});
	});
});


describe( 'Collection instance', function() {
  var filepath = __dirname + '/fixtures/players.json';
	var Players;
	
	beforeEach(function( done ) {
    rmrf( filepath, function (err) {
      if ( err ) throw err;

      Players = Collection({
        name: 'players',
        dataDir: __dirname + '/fixtures' 
      });
      done(); 
    });
	});

  describe( '#size()', function() {
    it( 'returns zero when the collection is empty', function() {
      assert.equal( Players.size(), 0 );
    });
  });

	describe( '#add(item)', function() {
    var player = { number: 12, name: 'Tom Brady', team: 'Patriots' };

    it( 'adds the given item to the collection', function() {
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
    beforeEach(function() {
      Players
        .add({
          number: 12,
          name: 'Tom Brady',
          position: 'Quarterback',
          team: 'Patriots'
        })
        .add({
          number: 18,
          name: 'Peyton Manning',
          position: 'Quarterback',
          team: 'Broncos'
        });
    });

    it( 'returns the collection if given an empty query', function() {
      var result = Players.find();

      assert.equal( result.length, 2 );
    });

    it( 'returns an empty Array if query does not match', function() {
      var result = Players.find({ team: 'Eagles' });

      assert.equal( result.length, 0 );
    });

    it( 'returns an Array of models that match query', function() {
      var result = Players.find({ position: 'Quarterback' });

      assert.equal( result.length, 2 );

      // check model properties
      assert.equal( typeof result[0].set, 'function' );
    });

    it( 'supports functions as queries', function() {
      var result = Players.find({ 
        number: function(n) {
          return n > 15;
        }
      });

      assert.equal( result.length, 1 );
      assert( result[0].get('number') > 15 );
    });
	});

	describe( '#findOne(query)', function() {
    beforeEach(function() {
      Players
        .add({
          number: 12,
          name: 'Tom Brady',
          position: 'Quarterback',
          team: 'Patriots'
        })
        .add({
          number: 18,
          name: 'Peyton Manning',
          position: 'Quarterback',
          team: 'Broncos'
        });
    });

    it( 'returns `undefined` when given an empty query', function() {
      var result = Players.findOne();

      assert.equal( typeof result, 'undefined' );
    });

    it( 'returns `undefined` if query does not match', function() {
      var result = Players.findOne({ team: 'Eagles' });

      assert.equal( typeof result, 'undefined' );
    });

    it( 'returns the first model that matches the query', function() {
      var result = Players.findOne({ position: 'Quarterback' }).toJSON();

      assert.equal( result.number, 12 );
    });

    it( 'supports functions as queries', function() {
      var player = Players.findOne({ 
        number: function(n) {
          return n > 15;
        }
      });

      assert.equal( player.get('name'), 'Peyton Manning' );
    });
	});

	describe( '#remove(query)', function() {
    beforeEach(function() {
      Players
        .add({
          number: 12,
          name: 'Tom Brady',
          position: 'Quarterback',
          team: 'Patriots'
        })
        .add({
          number: 18,
          name: 'Peyton Manning',
          position: 'Quarterback',
          team: 'Broncos'
        });
    });

    it( 'does not remove any items when given an empty query', function() {
      Players.remove();

      assert.equal( Players.size(), 2 );
    });

    it( 'does not remove any items that do not match the query', function() {
      Players.remove({ team: 'Eagles' });

      assert.equal( Players.size(), 2 );
    });

    it( 'removes models that match the query', function() {
      Players.remove({ number: 12 });

      assert.equal( Players.size(), 1 );
    });

    it( 'returns the collection for chaining', function() {
      Players
        .remove({ number: 12 })
        .remove({ number: 18 });

      assert.equal( Players.size(), 0 );
    });

    it( 'supports functions as queries', function() {
      var result = Players.remove({ 
        number: function(n) {
          return n > 15;
        }
      });
      assert.equal( result.size(), 1 );
    });
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
      var player = { number: 18, name: 'Peyton Manning', team: 'Broncos' };

      Players.add(player);

      Players.persist()
        .then(function() {
          fs.readFile( filepath, {
            encoding: 'utf-8' 
          }, function( err, contents ) {
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



  describe( 'history tracking', function() {
    describe( '#undo()', function() {
      it( 'undoes the last mutation', function() {
        Players
          .add({
            id: 1
          });

        assert( typeof Players.findOne({ id: 1 }), 'object' );
        Players.undo();
        assert( typeof Players.findOne({ id: 1 }), 'undefined' );
      });
    });

    describe( '#redo()', function() {
      it( 'undoes an undo()', function() {
        Players
          .add({
            id: 1
          });

        assert( typeof Players.findOne({ id: 1 }), 'object' );
        Players.undo();
        assert( typeof Players.findOne({ id: 1 }), 'undefined' );
        Players.redo();
        assert( typeof Players.findOne({ id: 1 }), 'object' );
      });

      it( 'mutating the state resets the top of the stack', function() {
        // meaning, no more redos :(
        Players
          .add({
            id: 1
          })
          .add({
            id: 2
          })
          .undo() // go back to when the state was just [{id:1}]
          .add({
            id: 3
          })
          .redo();

        assert.equal( typeof Players.findOne({ id: 1 }), 'object' );
        assert.equal( typeof Players.findOne({ id: 2 }), 'undefined' );
        assert.equal( typeof Players.findOne({ id: 3 }), 'object' );
      });
    });
  });
});