const operations = require('./bucketOps')
const path = require('path')

class Bucket {
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

  get site () {
    return this.options.site
  }

  get dir () {
    return (this.options.dir ? path.resolve(this.options.dir) : '')
  }

  get data () {
    return this._data
  }

  get siteInfo () {
    return this._siteInfo
  }

  get publicPolicy () {
    return {
      Version: '2008-10-17',
      Statement: [
        {
          Sid: 'Allow Public Access to All Objects',
          Effect: 'Allow',
          Principal: {
            'AWS': '*'
          },
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${this.name}/*`
        }
      ]
    }
  }

  exists () {
    return this.ops.exists()
  }

  create () {
    return this.exists()
              .then(() => {
                throw new Error('awsome-bucket-exists')
              })
              .catch((error) => {
                if (error.message === 'awsome-bucket-exists') {
                  throw new Error('Bucket already exists')
                }
                return this.ops.create().then(() => {
                  if (!this.site) {
                    return this
                  }
                  return this.ops.createSite()
                }).then(() => this.ops.createPolicy())
              })
  }

  retrieve () {
    return this.exists()
              .then(() => this.ops.retrieve())
              .then(() => {
                if (this.site) {
                  return this.ops.retrieveSite()
                }
                return this
              })
  }

  update () {
    return this.exists()
              .then(() => this.ops.update())
              .then(() => this.retrieve())
  }

  delete (options) {
    return this.exists()
              .then(() => {
                if (!this.site) {
                  return this
                }
                return this.ops.deleteSite()
              })
              .then(() => this.ops.delete())
  }
}

module.exports = Bucket
