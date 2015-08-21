var fs = require( 'fs' );
var path = require( 'path' );
var mkdirp = require( 'mkdirp' );
var Promise = require( 'promise' );

module.exports = function ( filepath ) {
  filepath = path.resolve( filepath );

  var fileObj = {
    read: function () {
      var data;
      var json;

      try {
        data = fs.readFileSync( filepath );
        json = JSON.parse( data );
      }
      catch ( err ) {
        console.error( 
          'Error while trying to read file:', filepath, '\n' +
          'Ensure file has correctly formatted JSON and try again.' 
        );
        throw err;
      }

      return json;
    },

    write: function( data ) {
      var json = JSON.stringify( data );

      return new Promise(function (resolve, reject) {
        mkdirp( path.dirname(filepath), function ( err ) {
          if ( err ) {
            console.error( err );
            return reject( err );
          }

          fs.writeFile( filepath, json, function (err) {
            if ( err ) reject( err );
            else {
              fileObj.exists = true;
              resolve();
            }
          });
        });
      });
    },

    exists: fs.existsSync( filepath )
  };

  return fileObj;
};