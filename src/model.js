var Immutable = require( 'immutable' );
var Map = Immutable.Map;
var List = Immutable.List;

/**
  * Updates the `oldMap` in `list` with `newMap`
  */
function updateCache( oldMap, newMap, collection ) {
  var list = collection._toList();
  var index = list.indexOf( oldMap );

  if ( index > -1 ) {
    list = list.set( index, newMap );
  }

  collection._update(list);
  return list;
}

/**
  * 
  */
module.exports = function Model(map, collection, cache) {
  var model;

  if ( !Map.isMap(map) ) {
    throw new Error( 'Missing map argument to Model constructor.' );
  }

  if ( typeof collection !== 'object' || 
       typeof collection.persist !== 'function' ) {
    throw new Error( 'Missing collection argument to Model constructor.' );
  }

  if ( !List.isList(cache) ) {
    throw new Error( 'Missing cache argument to Model constructor.' );
  }

  model = {
    get: function (key) {
      return map.get(key);
    },

    /**
      * 
      */
    set: function( key, value ) {
      var newMap;

      if ( typeof key === 'string' ) {
        newMap = map.set( key, value );
      }
      else if ( typeof key === 'object' ) {
        newMap = map.merge( key );
      }

      updateCache( map, newMap, collection );

      map = newMap;

      return model;
    },

    /**
      * 
      */
    remove: function( key ) {
      var newMap;

      newMap = map.delete( key );

      updateCache( map, newMap, collection );

      map = newMap;

      return model;
    },

    /**
      * @returns a promise that is executed after a successful write to disk.
      */
    save: function() {
      return collection.persist();
    },

    /**
      *
      */
    toJSON: function() {
      return map.toJSON();
    }
  };

  return model;
};