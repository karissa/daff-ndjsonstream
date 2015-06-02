var test = require('tape')
var diff = require('sorted-diff-stream')
var from = require('from2')
var through = require('through2')
var batcher = require('byte-stream')
var DATA = require('conflict-spectrum')

var daffStream = require('./')

var TABLES = DATA[0].json

test('knead from sorted-diff-stream', function (t) {
  function keyData (data) {
    var index = 0
    data.map(function (obj) {
      var rObj = {}
      rObj.key = index
      rObj.value = obj
      index++
      return rObj
    })
    return data
  }

  var older = from.obj(keyData(TABLES[1]))
  var newer = from.obj(keyData(TABLES[2]))

  function jsonEquals (a, b, cb) {
    if (JSON.stringify(a) === JSON.stringify(b)) cb(null, true)
    else cb(null, false)
  }

  var diffStream = diff(older, newer, jsonEquals)
  diffStream.pipe(batcher(3 * 2)).pipe(daffStream()).pipe(
    through.obj(function (data, enc, next) {
      var table1 = data.tables[0]
      var table2 = data.tables[1]
      console.log(data.visual)

      t.equals(table1.height, 4)
      t.equals(table2.height, 4)
      t.deepEquals(table1.columns, ['capital', 'country'])
      t.deepEquals(table2.columns, ['capital', 'code', 'country'])
      t.same(typeof data.visual, 'string')
      t.same(typeof next, 'function')
      t.end()
    })
  )
})
