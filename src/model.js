var Immutable = require( 'immutable' );
var Map = Immutable.Map;
var List = Immutable.List;

/**
  * Replaces the oldItem in collection with newItem.
  * @param {Map} oldItem - The item to be replaced, is used to find the index
  *   to be updated in the collection.
  * @param {Map} newItem
  * @param {Object} collection - The collection in which we'll swap the items.
  * @returns {Object} The updated state of the collection.
  */
function updateCache( oldItem, newItem, collection ) {
  var state = collection._getState();
  var index = state.indexOf( oldItem );

  if ( index > -1 ) {
    state = state.set( index, newItem );
  }

  collection._update(state);
  return state;
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
    /**
      * Returns the value of given key in the model.
      */
    get: function (key) {
      return map.get(key);
    },

    /**
      * @param {Object|String} - When a string, updates that key in the model
      *   with the given `value`.
      *
      *   When an object, merges its key-value pairs with those in the model.
      * @param {Any} (optional) value - The value to be updated in the model.
      * @returns The model for chianing purposes.
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
      * Removes a key from the model. This change will be reflected
      * in the model's collection.
      * @returns {Object} - the model for chaining purposes.
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
      * Returns pure JSON version of the model.
      * @returns {Object}
      */
    toJSON: function() {
      return map.toJSON();
    }
  };

  return model;
};