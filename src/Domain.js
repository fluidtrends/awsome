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
    if (!this._id || !this._id.split('/') || this._id.split('/').length < 3) {
      return null
    }

    return this._id.split('/')[2]
  }

  get zone () {
    return this._zone
  }

  isHosted (onlyTLD) {
    return this.ops.isHosted(onlyTLD)
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

  records (filter) {
    return this.isHosted(true)
               .then((domain) => this.ops.getRecords(filter))
  }

  isBucketLinked () {
    return this.isHosted(true)
               .then((domain) => this.ops.isBucketLinked())
               .then((domain) => this)
  }

  unlinkBucket () {
    return this.isBucketLinked()
               .then((domain) => this.ops.unlinkBucket())
               .then((domain) => this)
  }

  linkBucket () {
    return this.isBucketLinked()
               .then((domain) => { throw new Error('awsome-domain-bucket-is-already-linked') })
               .catch((error) => {
                 if (error.message === 'awsome-domain-bucket-is-already-linked') {
                   throw new Error('Bucket is already linked to this domain')
                 }
                 return this.ops.linkBucket().then(() => this)
               })
  }
}

module.exports = Domain
