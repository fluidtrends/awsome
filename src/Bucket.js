const aws = require('../lib/aws')
const fs = require('fs-extra')
const walk = require('walk')
const path = require('path')
const utils = require('./utils')

class Bucket {

  constructor (options) {
    this._options = Object.assign({}, options)
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

  exists () {
    return this._exists()
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
                return this._create().then(() => {
                  if (!this.site) {
                    return this
                  }
                  return this._createSite()
                }).then(() => this._createPolicy())
              })
  }

  retrieve () {
    return this.exists()
              .then(() => this._retrieve())
              .then(() => {
                if (this.site) {
                  return this._retrieveSite()
                }
                return this
              })
  }

  update () {
    return this.exists()
              .then(() => this._update())
              .then(() => this.retrieve())
  }

  delete (options) {
    return this.exists()
              .then(() => {
                if (!this.site) {
                  return this
                }
                return this._deleteSite()
              })
              .then(() => this._delete())
  }

  _exists () {
    return aws.s3('headBucket', { Bucket: this.name }).then(() => {
      return this
    })
  }

  _create () {
    return aws.s3('createBucket', { Bucket: this.name }).then(() => {
      return this
    })
  }

  _retrieve () {
    return aws.s3('listObjectsV2', { Bucket: this.name }).then((data) => {
      this._data = Object.assign({}, data)
      return this
    })
  }

  _delete () {
    return aws.s3('deleteBucket', { Bucket: this.name }).then(() => {
      this._data = null
      return this
    })
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

  _createSite () {
    var WebsiteConfiguration = {
      ErrorDocument: {
        Key: 'index.html'
      },
      IndexDocument: {
        Suffix: 'index.html'
      }
    }

    if (this.site.redirectTo) {
      WebsiteConfiguration = {
        RedirectAllRequestsTo: {
          HostName: this.site.redirectTo
        }
      }
    }

    return aws.s3('putBucketWebsite', {
      Bucket: this.name,
      ContentMD5: '',
      WebsiteConfiguration
    }).then(() => this._retrieveSite())
  }

  _createPolicy () {
    return aws.s3('putBucketPolicy', {
      Bucket: this.name,
      Policy: JSON.stringify(this.publicPolicy)
    }).then(() => {
      return this
    })
  }

  _retrieveSite () {
    return aws.s3('getBucketWebsite', { Bucket: this.name }).then((siteInfo) => {
      this._siteInfo = Object.assign({}, siteInfo)
      return this
    })
  }

  _deleteSite () {
    return aws.s3('deleteBucketWebsite', { Bucket: this.name }).then(() => {
      this._siteInfo = null
      return this
    })
  }

  _update () {
    if (!this.dir || !fs.existsSync(this.dir)) {
      return Promise.reject(new Error('Missing expected local directory'))
    }

    return this.retrieve()
               .then((bucket) => this._localAssets())
               .then((assets) => this._makeUpdatePatch(this.data.Contents, assets))
               .then((patch) => this._applyUpdatePatch(patch))
  }

  _localAssets () {
    return new Promise((resolve, reject) => {
      var assets = []
      var walker = walk.walk(this.dir, { followLinks: false })

      walker.on('file', (root, stat, next) => {
        const filepath = root + '/' + stat.name
        const key = filepath.substring(this.dir.length + 1)
        const content = fs.readFileSync(filepath)
        const contentType = utils.contentType(filepath)
        const hash = utils.hash(content)
        const etag = Buffer.from(hash, 'base64').toString('hex')
        assets.push({ key, contentType, filepath, hash, etag })
        next()
      })

      walker.on('end', function () {
        resolve(assets)
      })
    })
  }

  _makeUpdatePatch (remoteAssets, localAssets) {
    return new Promise((resolve, reject) => {
      if (!remoteAssets || remoteAssets.length <= 0) {
        resolve(localAssets.map(localAsset => {
          localAsset.action = 'upload'
          return localAsset
        }))
        return
      }

      var patch = []

      remoteAssets.forEach((remoteAsset) => {
        remoteAsset.ETag = remoteAsset.ETag.replace(/"/g, '')
        var removed = true
        localAssets.forEach((localAsset) => {
          if (remoteAsset.Key === localAsset.key) {
            removed = false
            // Update assets if they were changed
            localAsset.action = ((remoteAsset.ETag === localAsset.etag) ? 'skip' : 'upload')
            patch.push(localAsset)
          }
        })

        if (removed) {
          // Remove old assets
          patch.push({etag: remoteAsset.ETag, action: 'remove', key: remoteAsset.Key})
        }
      })

      localAssets.forEach((localAsset) => {
        var fresh = true
        remoteAssets.forEach((remoteAsset) => {
          if (remoteAsset.Key === localAsset.key) {
            // We always want to upload new assets
            fresh = false
          }
        })

        if (fresh) {
          localAsset.action = 'upload'
          patch.push(localAsset)
        }
      })

      resolve(patch)
    })
  }

  _applyUpdatePatch (patch) {
    return Promise.all(patch.map(asset => this._updateAsset(asset)))
  }

  _updateAsset (asset) {
    switch (asset.action) {
      case 'upload':
        return this._uploadAsset(asset)
      case 'remove':
        return this._removeAsset(asset)
    }
  }

  _uploadAsset (asset) {
    const content = fs.readFileSync(asset.filepath)
    return aws.s3('putObject', {
      Bucket: this.name,
      Key: asset.key,
      Body: content,
      ContentType: asset.contentType,
      ContentMD5: asset.hash
    })
  }

  _removeAsset (asset) {
    return aws.s3('deleteObject', {
      Bucket: this.name,
      Key: asset.key
    })
  }
}

module.exports = Bucket
