var Transform = require('stream').Transform
var inherits = require('inherits')
var debug = require('debug')('daff-stream')
var diff2daff = require('./diff2daff.js')

module.exports = DaffStream

inherits(DaffStream, Transform)
function DaffStream (rowPath) {
  /*
  transforms to:
    {
      tables: daff tables,
      visual: the terminal visual for that daff
    }
  */
  if (!(this instanceof DaffStream)) return new DaffStream(rowPath)
  Transform.call(this, {objectMode: true})
  this.destroyed = false
  this.rowPath = rowPath
}

DaffStream.prototype._transform = function (data, enc, next) {
  var self = this
  debug('_transform', data)
  var opts = {
    rowPath: self.rowPath
  }
  diff2daff(data, opts, function (tables, visual) {
    var output = {
      tables: tables,
      visual: visual
    }
    next(null, output)
  })
}

DaffStream.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true
  this.err = err
  this.end()
}
