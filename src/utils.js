const crypto = require('crypto')

function contentType (filename) {
  var lowercase = filename.toLowerCase()

  if (lowercase.indexOf('.html') >= 0) return 'text/html'
  if (lowercase.indexOf('.css') >= 0) return 'text/css'
  if (lowercase.indexOf('.json') >= 0) return 'application/json'
  if (lowercase.indexOf('.js') >= 0) return 'application/x-javascript'
  if (lowercase.indexOf('.png') >= 0) return 'image/png'
  if (lowercase.indexOf('.jpg') >= 0) return 'image/jpg'

  return 'application/octet-stream'
}

function hash (text) {
  return crypto.createHash('md5').update(text).digest('base64')
}

var utils = {
  contentType,
  hash
}

module.exports = utils
