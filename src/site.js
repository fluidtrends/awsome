const aws = require('../lib/aws')

const _site = (options) => ({
  domain: options.domain,
  options,
  getBucket: () => _bucket(options).get(),
  createBucket: () => _bucket(options).create(),
  removeBucket: () => _bucket(options).remove()
})

const _bucket = (options) => ({
  domain: options.domain,
  options,
  get: () => _getBucket(options),
  create: () => _createBucket(options),
  remove: () => _removeBucket(options)
})

function _getBucket (options) {
  return _s3('getBucketWebsite', options, { Bucket: options.domain })
}

function _createBucket (options) {
  return _getBucket(options)
          .then(() => {
            throw new Error('awsome-bucket-exists')
          })
          .catch((error) => {
            if (error.message === 'awsome-bucket-exists') {
              throw new Error('Site bucket already exists')
            }
            return _s3('createBucket', options, {
              Bucket: options.domain
            }).then(() => _s3('putBucketWebsite', options, Object.assign({}, {
              Bucket: options.domain,
              ContentMD5: '',
              WebsiteConfiguration: {
                ErrorDocument: {
                  Key: 'index.html'
                },
                IndexDocument: {
                  Suffix: 'index.html'
                }
              }
            })))
          })
}

function _removeBucket (options) {
  return _getBucket(options)
          .then(() => _s3('deleteBucketWebsite', options, {
            Bucket: options.domain
          }))
          .then(() => _s3('deleteBucket', options, {
            Bucket: options.domain
          }))
}

function _s3 (call, options, raw) {
  return aws.s3(call, raw).then(() => _bucket(options))
}

module.exports = _site
