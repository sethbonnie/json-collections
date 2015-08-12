var fs = require( 'fs' );
var path = require( 'path' );
var assert = require( 'assert' );
var rimraf = require( 'rimraf' );
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

  describe( 'returned file object .write()', function() {
    var filepath = path.resolve( __dirname, './fixtures/temp.json' );

    // Remove the temp file if it exists
    before( function (done) {
      fs.unlink( filepath, function (err) {
        if ( err ) console.error( err );
        done();
      });
    });

    // Clean up temp file
    after( function (done) {
      fs.unlink( filepath, function (err) {
        if ( err ) console.error( err );
        done();
      });
    });

    // Remove the temporary dirs
    after( function(done) {
      var dir = path.resolve( __dirname, './fixtures/a' );
      
      rimraf( dir, function (err) {
        if ( err ) console.error( err );
        done();
      });
    });

    it( 'returns a promise', function() {
      var file = store( filepath );
      var result = file.write({ "name": "test" });

      assert.equal( typeof result.then, 'function' );
    });


    it( 'creates the file if it did not exist', function( done ) {
      var file = store( filepath );
      var promise = file.write({ "name": "test" });

      promise.then( function() {
        fs.exists( filepath, function( exists ) {
          assert( exists );
          done();
        });
      });
    });

    it( 'creates the directory path if it does not exist', function( done ) {
      var filepath = path.resolve( __dirname, './fixtures/a/b/c/temp.json' );
      var dirname = path.dirname( filepath );
      var file = store( filepath );
      
      file
        .write({ "name": "user" })
        .then(function () {
          fs.exists( filepath, function (exists) {
            assert( exists );
            done();
          });
        });
    });
  });

  describe( 'returned file object .exists', function() {
    it( 'is true when the filepath exists', function() {
      var filepath = path.resolve( __dirname, './fixtures/asdf.json' );
      var file = store( filepath );

      assert.strictEqual( file.exists, false );
    });

    it( 'is false when the filepath does not exist', function() {
      var filepath = path.resolve( __dirname, './fixtures/users.json' );
      var file = store( filepath );

      assert.strictEqual( file.exists, true );
    });
  });
});