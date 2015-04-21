var test = require('tape')
var from = require('from2')

var daffStream = require('./index.js')
var DATA = require('test-data')

var TABLES = DATA.CONFLICTS.SMALL

test('dat2daff.fromReadStreams with limit', function (t) {
  var stream1 = from.obj(TABLES[1])
  var stream2 = from.obj(TABLES[2])
  var opts = {
    html: false,
    limit: 20
  }
  daffStream(stream1, stream2, opts, function (tables, visual, next) {
    var table1 = tables[0]
    var table2 = tables[1]
    t.equals(table1.height, 5)
    t.equals(table2.height, 12)
    t.deepEquals(table1.columns, ['capital', 'country'])
    t.deepEquals(table2.columns, ['capital', 'code', 'country'])
    t.same(typeof visual, 'string')
    t.same(typeof next, 'function')
    t.end()
  })
})
