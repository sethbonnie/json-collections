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
  var state;

  // State tracking
  var history = Immutable.List();
  var historyPos = 0;

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

  collection = {
    size: function () {
      return state.size;
    },

    add: function ( data ) {
      var map = Immutable.fromJS( data );

      this._update( state.push(map) );

      return collection;
    },

    find: function (query) {
      var keys = Object.keys( query );

      var result = state.filter( function (value) {
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
        return Model( item, collection, state );
      }).toArray();
    },

    findOne: function (query) {
      return this.find(query)[0];
    },

    remove: function (query) {
      var keys = Object.keys( query );

      // Since we want to keep the items that don't match, we flip the usual
      // false and true tests.
      this._update(state.filter(function (value) {
        var key;

        for ( var i = 0; i < keys.length; i++ ) {
          key = keys[i];
          if ( value.get(key) != query[key] ) {
            return true; 
          }
        }
        return false;
      }));

      return collection;
    },

    toArray: function () {
      return state.toArray();
    },

    toJSON: function () {
      return state.toJSON();
    },

    persist: function () {
      var promise = file.write( state.toJSON() );
      return promise;
    },

    undo: function () {
      historyPos--;
      state = history.get( historyPos );
      return collection;
    },

    _update: function (list) {
      if ( Immutable.List.isList(list) ) {
        // first condense the history to the current position;
        history = history.setSize( historyPos );
        historyPos++;
        history = history.push( list );

        // update the state
        state = list;
      }
    },

    _toList: function () {
      return state;
    }
  };

  return collection; 
};