const fs = require('fs-extra')
const walk = require('walk')
const aws = require('../lib/aws')
const utils = require('./utils')
const path = require('path')

function _exists (bucket) {
  return aws.s3('headBucket', { Bucket: bucket.name }).then(() => {
    return bucket
  })
}

function _create (bucket) {
  return aws.s3('createBucket', { Bucket: bucket.name }).then(() => {
    return bucket
  })
}

function _retrieve (bucket) {
  return aws.s3('listObjectsV2', { Bucket: bucket.name }).then((data) => {
    bucket._data = Object.assign({}, data)
    return bucket
  })
}

function _delete (bucket) {
  return aws.s3('deleteBucket', { Bucket: bucket.name }).then(() => {
    bucket._data = null
    return bucket
  })
}

function _retrieveSite (bucket) {
  return aws.s3('getBucketWebsite', { Bucket: bucket.name }).then((siteInfo) => {
    bucket._siteInfo = Object.assign({}, siteInfo)
    return bucket
  })
}

function _createSite (bucket) {
  var WebsiteConfiguration = {
    ErrorDocument: {
      Key: 'index.html'
    },
    IndexDocument: {
      Suffix: 'index.html'
    }
  }

  if (bucket.site.redirectTo) {
    WebsiteConfiguration = {
      RedirectAllRequestsTo: {
        HostName: bucket.site.redirectTo
      }
    }
  }

  return aws.s3('putBucketWebsite', {
    Bucket: bucket.name,
    ContentMD5: '',
    WebsiteConfiguration
  }).then(() => _retrieveSite(bucket))
}

function _createPolicy (bucket) {
  return aws.s3('putBucketPolicy', {
    Bucket: bucket.name,
    Policy: JSON.stringify(bucket.publicPolicy)
  }).then(() => {
    return bucket
  })
}

function _deleteSite (bucket) {
  return aws.s3('deleteBucketWebsite', { Bucket: bucket.name }).then(() => {
    bucket._siteInfo = null
    return bucket
  })
}

function _update (bucket) {
  if (!bucket.dir || !fs.existsSync(bucket.dir)) {
    return Promise.reject(new Error('Missing expected local directory'))
  }

  return bucket.retrieve()
               .then((b) => _localAssets(bucket))
               .then((assets) => _makeUpdatePatch(bucket, bucket.data.Contents, assets))
               .then((patch) => _applyUpdatePatch(bucket, patch))
}

function _localAssets (bucket) {
  return new Promise((resolve, reject) => {
    var assets = []
    var walker = walk.walk(bucket.dir, { followLinks: false })

    walker.on('file', (root, stat, next) => {
      const filepath = root + '/' + stat.name
      const key = filepath.substring(bucket.dir.length + 1)
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

function _makeUpdatePatch (bucket, remoteAssets, localAssets) {
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

function _applyUpdatePatch (bucket, patch) {
  return Promise.all(patch.map(asset => _updateAsset(bucket, asset)))
}

function _updateAsset (bucket, asset) {
  switch (asset.action) {
    case 'upload':
      return _uploadAsset(bucket, asset)
    case 'remove':
      return _removeAsset(bucket, asset)
  }
}

function _uploadAsset (bucket, asset) {
  const content = fs.readFileSync(asset.filepath)
  return aws.s3('putObject', {
    Bucket: bucket.name,
    Key: asset.key,
    Body: content,
    ContentType: asset.contentType,
    ContentMD5: asset.hash
  })
}

function _removeAsset (bucket, asset) {
  return aws.s3('deleteObject', {
    Bucket: bucket.name,
    Key: asset.key
  })
}

const operations = (bucket) => ({
  exists: () => _exists(bucket),
  create: () => _create(bucket),
  retrieve: () => _retrieve(bucket),
  delete: () => _delete(bucket),
  retrieveSite: () => _retrieveSite(bucket),
  createSite: () => _createSite(bucket),
  createPolicy: () => _createPolicy(bucket),
  deleteSite: () => _deleteSite(bucket),
  update: () => _update(bucket)
})

module.exports = operations
