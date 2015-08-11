var assert = require( 'assert' );
var path = require( 'path' );
var store = require( '../src/file-store' );

describe( 'store(filepath)', function() {

  it( 'returns a file object with read and write methods', function() {
    var filepath = path.resolve( __dirname, './fixtures/users.json' );
    var file = store( filepath );

    assert.equal( typeof file.read, 'function' );
    assert.equal( typeof file.write, 'function' );
  });

  describe( 'returned file object .read()', function() {
    it( 'throws if the path does not exist', function() {
      var filepath = path.resolve( __dirname, './fixtures/asdf.json' );
      var file = store( filepath );

      assert.throws( function() {
        file.read();
      });
    });

    it( 'throws if the given filepath is not properly formatted json', function() {
      var filepath = path.resolve( __dirname, './fixtures/incorrect.json' );
      var file = store( filepath );

      assert.throws( function() {
        file.read();
      });
    });

    it( 'returns an object with the proper values', function() {
      var filepath = path.resolve( __dirname, './fixtures/users.json' );
      var file = store( filepath );
      var obj = file.read();

      assert.equal( obj.length, 3 );
      assert.equal( obj[0].id, 1 );
    });
  });
});