var fs = require( 'fs' );
var path = require( 'path' );
var assert = require( 'assert' );
var Collection = require( '../src/collection' );

describe( 'model api', function () {
  var Players;
  var model;

  beforeEach(function () {
    Players = Collection({
      name: 'players',
      dataDir: __dirname + '/fixtures'
    });

    Players
      .add({
        id: 1,
        name: 'Peyton Manning',
        team: 'Colts'
      })
      .add({
        id: 2,
        name: 'Tom Brady',
        team: 'Patriots'
      });

    model = Players.findOne({ id: 1 });
  });

  describe( 'get(key)', function () {
    it( 'returns the value at the given key', function () {
      assert.equal( model.get('name'), 'Peyton Manning' );
    });
  });

  describe( 'set(key, value)', function () {
    it( 'updates the value at the key', function () {
      assert.equal( model.get('team'), 'Colts' );
      model.set( 'team', 'Broncos' );
      assert.equal( model.get('team'), 'Broncos' );
    });

    it( 'creates the value at the key if the key does not exist', function () {
      assert( !model.get('position') );
      model.set( 'position', 'quarterback' );
      assert( model.get('position') );
    });

    it( 'updates should be reflected in the collection', function() {
      var player; 
      player = Players.findOne({ number: 18 });
      assert( !player );

      model.set( 'number', 18 );  

      player = Players.findOne({ number: 18 });
      assert( player );
    });
  });

  describe( 'set( dataObj )', function () {
    it( 'updates each of the keys in dataObj', function () {
      model.set({
        number: 18,
        rating: 98.3
      });

      assert.equal( model.get('number'), 18 );
      assert.equal( model.get('rating'), 98.3 );
    });
  });

  describe( 'remove(key)', function () {
    it( 'removes the key from the model', function () {
      assert( model.get('team') );
      model.remove('team');
      assert( !model.get('team') );
    });

    it( 'should be reflected in the collection', function () {
      var player = Players.findOne({ team: 'Colts' });
      assert( player );

      model.remove('team');

      player = Players.findOne({ team: 'Colts' });
      assert( !player );
    });
  });

  describe( 'toJSON()', function () {
    it( 'returns a correctly formatted object', function () {
      var obj = model.toJSON();

      assert.equal( obj.id, 1 );
      assert.equal( obj.name, 'Peyton Manning' );
      assert.equal( obj.team, 'Colts' );
    });
  });

  describe( 'save()', function () {
    it( 'updates the JSON file on disk', function (done) {
      var player = model.toJSON();
      var filepath = path.resolve( __dirname, 'fixtures', 'players.json' );

      model.save()
        .then(function () {
          // file should exist here
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
});