var Immutable = require( 'immutable' );
var store = require( './file-store' );
var Model = require( './model' );

/**
  * 
  */
module.exports = function Collection( options ) {
  var filepath = options.filepath;
  var schema = options.schema;

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
      return file.write( JSON.stringify(cache.toJSON()) );
    }
  };

  return collection; 
};