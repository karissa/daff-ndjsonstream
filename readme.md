# node-daff-stream
[![NPM](https://nodei.co/npm/daff-stream.png)](https://nodei.co/npm/daff-stream/)

Turns a [sorted-diff-stream](maxogden/sorted-diff-stream) into a stream of [daff](paulfitz/daff) terminal visuals.

You'll want to first `batch` the diff stream so that it wont be too big for terminal output.

```js
var diff = require('sorted-diff-stream')
var from = require('from2')
var through = require('through2')
var batcher = require('byte-stream')
var daffStream = require('daff-stream')

var older = from.obj({ key: 1, value: {'a': 1, 'b': 2, 'c': 3})
var newer = from.obj({ key: 1, value: {'a': 3, 'b': 2, 'c': 3, 'd': 4})

var diffStream = diff(older, newer)
var limit = 50
var getRow = function (data) { return data }

diffStream.pipe(batcher(limit)).pipe(daffStream(getRow)).pipe(through.obj(data, enc, next) {
  console.log(data.visual) // the terminal output
  console.log(data.tables[0]) // the older daff table
  console.log(data.tables[1]) // the newer daff table
})
```

### API

You can provide a function to the daffStream which will be used as the way to get access to the row from the original data.

Example:
```js

var older = from.obj({ key: 1, value: { change: 3, row: {'a': 1, 'b': 2, 'c': 3}}})
var newer = from.obj({ key: 1, value: { change: 4, row: {'a': 3, 'b': 2, 'c': 3, 'd': 4}}})

var getRow = function (data) {
  // data := { change: ..., row: ... }
  return data.row
}
```

### TODO:
  * support html output
