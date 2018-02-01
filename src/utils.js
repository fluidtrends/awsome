const crypto = require('crypto')
const path = require('path')

function contentType (filename) {
  const index = {
    html: 'text/html',
    css: 'text/css',
    json: 'application/json',
    js: 'application/x-javascript',
    png: 'image/png',
    jpg: 'image/jpg',
    gif: 'image/gif'
  }

  var ext = path.extname(filename)
  if (!ext) {
    return 'application/octet-stream'
  }

  return index[ext.substring(1)] || 'application/octet-stream'
}

function hash (text) {
  return crypto.createHash('md5').update(text).digest('base64')
}

var utils = {
  contentType,
  hash
}

module.exports = utils
