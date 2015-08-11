var fs = require( 'fs' );
var path = require( 'path' );
var Promise = require( 'promise' );

module.exports = function ( filepath ) {
  var filepath = path.resolve( filepath );
  var exists = fs.existsSync( filepath );

  var fileObj = {
    read: function () {
      var data;
      var json;

      try {
        data = fs.readFileSync( filepath );
        json = JSON.parse( data );
      }
      catch ( err ) {
        console.error( 'An error occurred while trying to read file:', filepath );
        console.error( 'Ensure that the file has correctly formatted JSON and try again.' );
        throw err;
      }

      return json;
    },

    write: function( data ) {
      var json = JSON.stringify( data );

      return new Promise(function (resolve, reject) {
        fs.writeFile( filepath, data, function (err) {
          if ( err ) reject( err );
          else {
            fileObj.exists = true;
            resolve();
          }
        });
      });
    },

    exists: fs.existsSync( filepath )
  }

  return fileObj;
};