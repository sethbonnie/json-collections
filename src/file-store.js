var fs = require( 'fs' );
var path = require( 'path' );
var mkdirp = require( 'mkdirp' );
var Promise = require( 'promise' );

/**
  * Given a file path, creates an object with wrapper functions around
  * reading (synchronously) and writing (asynchronously).
  * @param {String} filepath - The filepath to be read from and written to.
  * @returns {Object} An object with `read()` and `write()` methods to the
  *   enclosed filepath.
  */
module.exports = function ( filepath ) {
  filepath = path.resolve( filepath );

  var fileObj = {
    /**
      * Synchronously tries to read and parse JSON from the enclosed filepath.
      * @returns {Object} - The JSON parsed from the file.
      */
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

    /**
      * Writes the given data to the enclosed filepath.
      * @param {Object} - An object that is easily convertible to JSON.
      * @returns {Promise} - A promise that is resolved upon completion of 
      *   the write to disk, it is rejected if any errors occur.
      */
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