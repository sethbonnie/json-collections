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
...

### Model
...
