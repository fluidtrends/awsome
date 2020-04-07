const fs = require('fs-extra')
const amplify = require('../lib/amplify')
const utils = require('./utils')

function _init (cloud) {
    return amplify.init(cloud.options)
}
  
const operations = (cloud) => ({
    init: () => _init(cloud)
})
  
module.exports = operations