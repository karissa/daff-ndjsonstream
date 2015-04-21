var daff = require('daff')
var batcher = require('byte-stream')
var through = require('through2')

module.exports = NdjsonStream

function NdjsonStream (stream1, stream2, opts, cb) {
  // takes two ndjson streams
  // TODO: modularize into daff's core
  // returns cb(table1, table2, visual, next)

  if (!opts) opts = {}
  if (!opts.limit) opts.limit = 20
  if (!cb) throw new Error('no callback')

  stream1 = createBatchedStream(stream1, opts.limit)
  stream2 = createBatchedStream(stream2, opts.limit)

  batchedStreamToTable(stream1, function (table1, next1) {
    batchedStreamToTable(stream2, function (table2, next2) {
      var tables = [table1, table2]
      var visual = tablesToVisual(tables, opts)

      cb(tables, visual, function next (cb) {
        next1()
        next2()
      })
    })
  })
}

function createBatchedStream (stream, limit) {
  var batchedStream = batcher(limit)
  return stream.pipe(batchedStream)
}

function batchedStreamToTable (stream, cb) {
  stream.pipe(through.obj(function (data, enc, next) {
    var table = new daff.NdjsonTable(data)
    cb(table, next)
  }))
}

function tablesToVisual (tables, opts) {
  var flags = new daff.CompareFlags()

  var table1 = tables[0]
  var table2 = tables[1]

  var alignment = daff.compareTables(table1, table2, flags).align()
  var highlighter = new daff.TableDiff(alignment, flags)
  var table_diff = new daff.SimpleTable()
  highlighter.hilite(table_diff)

  if (opts.html) {
    var diff2html = new daff.DiffRender()
    diff2html.render(table_diff)
    var table_diff_html = diff2html.html()
    return table_diff_html
  } else {
    var diff2terminal = new daff.TerminalDiffRender()
    return diff2terminal.render(table_diff)
  }
}
