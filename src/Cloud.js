const operations = require('./cloudOps')
const path = require('path')

class _ {
    constructor (options) {
      this._options = Object.assign({}, options)
      this._ops = operations(this)
    }
  
    get ops () {
      return this._ops
    }

    get options () {
      return this._options
    }
  
    get name () {
      return this.options.name
    }

    init() {
        return this.ops.init()
    }
}

module.exports = _