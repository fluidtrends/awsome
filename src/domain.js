const operations = require('./domainOps')

class Domain {
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

  get ref () {
    return this._ref
  }

  get name () {
    return this.options.name
  }

  get id () {
    return this._id
  }

  get zone () {
    return this._zone
  }

  isHosted () {
    return this.ops.isHosted()
  }

  host () {
    return this.isHosted()
               .then((domain) => { throw new Error('awsome-domain-ishosted') })
               .catch((error) => {
                 if (error.message === 'awsome-domain-ishosted') {
                   throw new Error('Domain is already hosted')
                 }
                 return this.ops.host().then(() => this)
               })
  }

  unhost () {
    return this.isHosted()
               .then((domain) => this.ops.unhost())
               .then((domain) => this)
  }
}

module.exports = Domain
