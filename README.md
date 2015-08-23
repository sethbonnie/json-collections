JSON-Collections
=================

`JSON-Collections` is a set of abstractions wrapping a familiar querying interface over JSON files. JSON files are the ideal prototyping storage mechanism since they are easily read and written to -- you can just open them your favorite editor. However, the usual interface to them is too low-level to work with quickly. This library aims to solve that.

### Install

```sh
npm install --save json-collections
```

### Usage

```js
var Collection = require( 'json-collections' );
var Players = Collection( 'players', { dir: './data' });

Players
.add({
  id: 1,
  firstname: "Tom",
  lastname: "Brady",
  number: 12,
  team: "Patriots"
})
.add({
  id: 2,
  firstname: 'Peyton",
  lastname: 'Manning",
  number: 18,
  team: "Broncos"
})
.add({
  id: 3,
  firstname: "Rob",
  nickname: "Gronk",
  lastname: "Gronkowski",
  number: 87,
  team: "Patriots
})
.add({
  id: 4,
  firstname: "Wes",
  lastname: "Welker",
  number: 83,
  team: "Broncos"
});


// Find all the Patriots players
Players.findOne({ team: "Patriots" });

// Find players with a jersey # in the 80s, most likely a receiver
Players.find({
  number: function(n) { return 80 <= n && n <= 89; }
});

// Find a player named "Peyton Manning"
Players.findOne({firstname: "Peyton", lastname: "Manning"});

// Save our collection to disk.
Players.persist();
```

API
----

### Collection

`add(item)`
Adds an item to the collection.

`size()`
Returns the number of items in the collection.

`find(query)`
Returns a list of items that match the given query.

`findOne(query)`
Returns the first model that matches the given query; otherwise, it 
returns `undefined`.

`remove(query)`
Removes the items that match the given query from the collection.

`persist()`
Writes the current state of the collection to disk.

`toArray()`
Returns the collection as an array of models.

`toJSON()`
Returns a pure data array of the items in the collection.

`undo()`
Undoes any previous mutable actions such as `add()` or `remove()`.

`redo()`
Redoes any `undo()` calls. Does nothing if the last action was a mutating
action such as `remove()` or `add()`.

### Model

`get(key)`
Returns the value of the given `key` in the model.

`set(key, value)`
Updates the `key` in the model with the given `value`.

`set(dataObj)`
Merges the `key` value pairs in the given object with those in the model.

`remove(key)`
Permanently removes a `key` from the model. This change is immediately
reflected in the model's collection.

`save()`
Saves the current state of the model to disk.

`toJSON()`
Returns a pure JSON data version of the model.
