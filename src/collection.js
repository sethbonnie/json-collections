var path = require( 'path' );
var Immutable = require( 'immutable' );
var store = require( './file-store' );
var Model = require( './model' );

/**
  * @param config - an object containing the configuration parameters for this
  *   collection. It *MUST* contain a <String> name parameter.
  *
  *   You can also choose to give it a `dataDir` param, which defaults to the 
  *   current directory if not given. This will be used as the location to 
  *   save the JSON file.
  * @returns a collection object which can be used to manipulate the JSON in memory
  *   and persist it to disk.
  */
module.exports = function Collection( config ) {
  var name = config.name;
  var dataDir = config.dataDir || '.';
  var filepath = path.resolve( dataDir, name + '.json' );

  if ( typeof name !== 'string' ) {
    throw new Error( 'Collection must be passed an object with a name parameter.' );
  }

  // Our internal collection
  var cache;

  // Our external api
  var collection;

  // Reference to the file object
  var file = store( filepath );

  if ( !file.exists ) {
    // Create an empty list
    cache = Immutable.List();
  }
  else {
    cache = Immutable.fromJS( file.read() );
  }

  collection = {
    add: function ( data ) {
      var map = Immutable.fromJS( data );

      cache = cache.push( map );

      return collection;
    },

    find: function (query) {
      var keys = Object.keys( query );

      var result = cache.filter( function (value) {
        var key;
        for ( var i = 0; i < keys.length; i++) {
          key = keys[i];
          if ( value.get(key) != query[key] ) {
            return false;
          }
        }
        return true;
      });

      return result.map( function (item) {
        return Model( item, collection, cache );
      }).toArray();
    },

    findOne: function (query) {
      return this.find(query)[0];
    },

    remove: function (query) {
      var keys = Object.keys( query );

      cache = cache.filter(function (value) {
        var key;

        for ( var i = 0; i < keys.length; i++ ) {
          key = keys[i];
          if ( value.get(key) != query[key] ) {
            return false; 
          }
        }
        return true;
      });

      return collection;
    },

    toArray: function () {
      return cache.toArray();
    },

    toJSON: function () {
      return cache.toJSON();
    },

    persist: function () {
      return file.write( cache.toJSON() );
    }
  };

  return collection; 
};