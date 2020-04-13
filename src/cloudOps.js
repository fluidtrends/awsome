const amplify = require('../lib/amplify')

function _init (cloud) {
    return amplify.init(cloud.options)
}
  
function _status (cloud) {
    return amplify.status(cloud.options)
}

function _push (cloud) {
    return amplify.push(cloud.options)
}

const operations = (cloud) => ({
    init: () => _init(cloud),
    status: () => _status(cloud),
    push: () => _push(cloud)
})
  
module.exports = operations