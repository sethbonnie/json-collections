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
  * @returns a collection object which can be used to manipulate the JSON in
  *   memory and persist it to disk.
  */
module.exports = function Collection( config ) {
  var name = config.name;
  var dataDir = config.dataDir || '.';
  var filepath = path.resolve( dataDir, name + '.json' );

  if ( typeof name !== 'string' ) {
    throw new Error( 
      'Collection must be passed an object with a "name" parameter.'
    );
  }

  // Our internal collection
  var state;

  // State tracking
  var history = Immutable.List();
  var historyPos;

  // Our external api
  var collection;

  // Reference to the file object
  var file = store( filepath );

  if ( !file.exists ) {
    // Create an empty list
    state = Immutable.List();
  }
  else {
    state = Immutable.fromJS( file.read() );
  }

  history = history.push(state);
  historyPos = 0;

  collection = {
    /**
      * Returns the number of items in the collection.
      * @returns {Number} The current size of the collection.
      */
    size: function () {
      return state.size;
    },

    /**
      * Adds an item to the collection.
      * @param {Object} item - An object to be appended to the collection.
      * @return {Object} The collection itself.
      */
    add: function ( item ) {
      var map = Immutable.fromJS( item );

      this._update( state.push(map) );

      return collection;
    },

    /**
      * Returns a list of items that match the given query.
      * @param {Object} query - An object with keys matching those of the
      *   items in the collection. If the values in the query match an item
      *   in the collection, then that item is returned as part of the result.
      * @returns {Array} An array of models that match the given query.
      */
    find: function (query) {
      var keys = Object.keys( query );

      var result = state.filter( function (value) {
        var key;
        for ( var i = 0; i < keys.length; i++) {
          key = keys[i];
          if ( value.get(key) !== query[key] ) {
            return false;
          }
        }
        return true;
      });

      return result.map( function (item) {
        return Model( item, collection, state );
      }).toArray();
    },

    /**
      * Returns the first item that matches the given query; otherwise,
      * it returns undefined.
      * @param query - An object containing values to be matched against items
      *   in the collection.
      * @returns {Object} - A model matching the given query.
      */
    findOne: function (query) {
      return this.find(query)[0];
    },

    /**
      * Removes the items that match the query from the collection.
      * @param query - An object containing values to be matched against items
      *   in the collection.
      * @returns {Object} - The collection with items that matched the query
      *   removed.
      */
    remove: function (query) {
      var keys = Object.keys( query );

      // Since we want to keep the items that don't match, we flip the usual
      // false and true tests.
      this._update(state.filter(function (value) {
        var key;

        for ( var i = 0; i < keys.length; i++ ) {
          key = keys[i];
          if ( value.get(key) !== query[key] ) {
            return true; 
          }
        }
        return false;
      }));

      return collection;
    },

    /**
      * Returns an array of the items in the collection as models.
      * @returns {Array}
      */
    toArray: function () {
      return state.toArray();
    },

    /**
      * Returns a pure JS array of objects. It's not quite a string,
      * but one that can be stringified easily.
      * @returns {Array}
      */
    toJSON: function () {
      return state.toJSON();
    },

    /**
      * Persists the current state of the collection to disk.
      * @returns {Promise} - A promise that is resolved when the collection
      *   has been written to disk.
      */
    persist: function () {
      var promise = file.write( state.toJSON() );
      return promise;
    },

    /**
      * Undoes any previous mutable actions such as `add()` or `remove()`.
      * @returns {Object} - THe collection for chaining purposes.
      */
    undo: function () {
      historyPos--;
      if ( historyPos < 1 ) {
        historyPos = 0;
      }
      state = history.get( historyPos );
      return collection;
    },

    /**
      * Redoes any `undo()` calls. Does nothing if the last action was a 
      * mutating action such as `remove()` or `add()`.
      * @returns {Object} - The collection mostly for chaining.
      */
    redo: function () {
      historyPos++;
      if ( historyPos >= history.size ) {
        historyPos = history.size - 1;
      }
      state = history.get( historyPos );

      return collection;
    },

    _update: function (newState) {
      if ( Immutable.List.isList(newState) ) {
        // first condense the history to the current position;
        history = history.setSize( historyPos + 1 );
        historyPos++;
        history = history.push( newState );

        // update the state
        state = newState;
      }
    },

    _toList: function () {
      return state;
    }
  };

  return collection; 
};