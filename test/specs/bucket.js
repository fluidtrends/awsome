const savor = require('savor')
const Bucket = savor.src('Bucket')
const aws = savor.src('../lib/aws')
const fs = require('fs-extra')
const path = require('path')

function _stubWithSuccess (context, service, calls, data) {
  calls.map(call => context.stub(service, call).callsFake((options, callback) => callback(null, data)))
}

function _stubWithError (context, service, calls, error) {
  calls.map(call => context.stub(service, call).callsFake((options, callback) => callback(error)))
}

function _unstub (service, calls) {
  calls.map(call => service[call].restore())
}

savor.add('fail without an AWS access key', (context, done) => {
  const calls = ['createBucket']
  _stubWithError(context, aws._s3, ['headBucket'], new Error('bucket does not exist'))
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })

  savor.promiseShouldFail(new Bucket({ name: 'test-bucket' }).create(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._s3, calls.concat(['headBucket']))
    // Mock the access key
    process.env.AWS_ACCESS_KEY_ID = 'test'
  })
})

.add('fail without an AWS secret key', (context, done) => {
  const calls = ['createBucket']
  _stubWithError(context, aws._s3, ['headBucket'], new Error('bucket does not exist'))
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })

  savor.promiseShouldFail(new Bucket({ name: 'test-bucket' }).create(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._s3, calls.concat(['headBucket']))
    // Mock the secret key
    process.env.AWS_SECRET_ACCESS_KEY = 'test'
  })
})

.add('create a new regular bucket', (context, done) => {
  const calls = ['createBucket', 'putBucketPolicy']
  _stubWithError(context, aws._s3, ['headBucket'], new Error('bucket does not exist'))
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })

  savor.promiseShouldSucceed(new Bucket({ name: 'test-bucket' }).create(), done, (bucket) => {
    context.expect(bucket.name).to.equal('test-bucket')
    _unstub(aws._s3, calls.concat(['headBucket']))
  })
})

.add('create a new site bucket', (context, done) => {
  const calls = ['putBucketWebsite', 'putBucketPolicy', 'createBucket', 'getBucketWebsite']
  _stubWithError(context, aws._s3, ['headBucket'], new Error('bucket does not exist'))
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })

  savor.promiseShouldSucceed(new Bucket({ name: 'test-bucket', site: true }).create(), done, (bucket) => {
    context.expect(bucket.name).to.equal('test-bucket')
    _unstub(aws._s3, calls.concat(['headBucket']))
  })
})

.add('create a new redirected site bucket', (context, done) => {
  const calls = ['putBucketWebsite', 'putBucketPolicy', 'createBucket', 'getBucketWebsite']
  _stubWithError(context, aws._s3, ['headBucket'], new Error('bucket does not exist'))
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })

  savor.promiseShouldSucceed(new Bucket({ name: 'test-bucket', site: { redirectTo: 'new-bucket' } }).create(), done, (bucket) => {
    context.expect(bucket.name).to.equal('test-bucket')
    context.expect(bucket.site.redirectTo).to.equal('new-bucket')
    _unstub(aws._s3, calls.concat(['headBucket']))
  })
})

.add('make sure an existing regular bucket cannot be added', (context, done) => {
  const calls = ['listObjectsV2', 'headBucket']
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })
  savor.promiseShouldFail(new Bucket({ name: 'test-bucket' }).create(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._s3, calls)
  })
})

.add('make sure an existing site bucket cannot be added', (context, done) => {
  const calls = ['listObjectsV2', 'getBucketWebsite', 'headBucket']
  _stubWithSuccess(context, aws._s3, calls, { test: 'test', site: true })
  savor.promiseShouldFail(new Bucket({ name: 'test-bucket' }).create(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._s3, calls)
  })
})

.add('ensure an existing regular bucket can be retrieved', (context, done) => {
  const calls = ['listObjectsV2', 'headBucket']
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })
  savor.promiseShouldSucceed(new Bucket({ name: 'test-bucket' }).retrieve(), done, (bucket) => {
    context.expect(bucket.name).to.equal('test-bucket')
    context.expect(bucket.data.test).to.equal('test')
    _unstub(aws._s3, calls)
  })
})

.add('ensure an existing site bucket can be retrieved', (context, done) => {
  const calls = ['listObjectsV2', 'getBucketWebsite', 'headBucket']
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })
  savor.promiseShouldSucceed(new Bucket({ name: 'test-bucket', site: true }).retrieve(), done, (bucket) => {
    context.expect(bucket.name).to.equal('test-bucket')
    context.expect(bucket.data.test).to.equal('test')
    context.expect(bucket.siteInfo.test).to.equal('test')
    _unstub(aws._s3, calls)
  })
})

.add('make sure an non-existing regular bucket cannot be retrieved', (context, done) => {
  const calls = ['headBucket']
  _stubWithError(context, aws._s3, calls, new Error('test'))
  savor.promiseShouldFail(new Bucket({ name: 'test-bucket' }).retrieve(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._s3, calls)
  })
})

.add('remove an existing regular bucket', (context, done) => {
  const calls = ['deleteBucket', 'headBucket']
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })

  savor.promiseShouldSucceed(new Bucket({ name: 'test-bucket' }).delete(), done, (bucket) => {
    context.expect(bucket.name).to.equal('test-bucket')
    _unstub(aws._s3, calls)
  })
})

.add('remove an existing site bucket', (context, done) => {
  const calls = ['deleteBucketWebsite', 'deleteBucket', 'headBucket']
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })

  savor.promiseShouldSucceed(new Bucket({ name: 'test-bucket', site: true }).delete(), done, (bucket) => {
    context.expect(bucket.name).to.equal('test-bucket')
    _unstub(aws._s3, calls)
  })
})

.add('make sure an non-existing regular bucket cannot be retrieved', (context, done) => {
  const calls = ['headBucket']
  _stubWithError(context, aws._s3, calls, new Error('test'))
  savor.promiseShouldFail(new Bucket({ name: 'test-bucket' }).retrieve(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._s3, calls)
  })
})

.add('make sure an non-existing site bucket cannot be retrieved', (context, done) => {
  const calls = ['headBucket']
  _stubWithError(context, aws._s3, calls, new Error('test'))
  savor.promiseShouldFail(new Bucket({ name: 'test-bucket', site: true }).retrieve(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._s3, calls)
  })
})

.add('fail to update a bucket without a local directory location', (context, done) => {
  const calls = ['headBucket']
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })
  savor.promiseShouldFail(new Bucket({ name: 'test-bucket', site: true }).update(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._s3, calls)
  })
})

.add('fail to update a bucket with a missing local directory location', (context, done) => {
  const calls = ['headBucket']
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })
  savor.promiseShouldFail(new Bucket({ name: 'test-bucket', site: true, dir: 'dummy'}).update(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._s3, calls)
  })
})

.add('update a bucket for the first time', (context, done) => {
  const bucketName = 'test-bucket'

  savor.addAsset('assets/local', 'www', context)
  const www = path.join(context.dir, 'www')
  context.expect(fs.existsSync(www)).to.be.true

  const calls = ['getBucketWebsite', 'putObject', 'headBucket', 'listObjectsV2']
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })

  savor.promiseShouldSucceed(new Bucket({ name: bucketName, site: true, dir: 'www' }).update(), done, (bucket) => {
    context.expect(bucket.name).to.equal(bucketName)
    _unstub(aws._s3, calls)
  })
})

.add('update a bucket without any remote assets', (context, done) => {
  savor.addAsset('assets/local', 'www', context)
  const calls = ['getBucketWebsite', 'putObject', 'headBucket', 'listObjectsV2']
  _stubWithSuccess(context, aws._s3, calls, { Contents: [] })

  savor.promiseShouldSucceed(new Bucket({ name: 'test-bucket', site: true, dir: 'www' }).update(), done, (bucket) => {
    context.expect(bucket.name).to.equal('test-bucket')
    _unstub(aws._s3, calls)
  })
})

.add('update a bucket without some remote assets', (context, done) => {
  savor.addAsset('assets/local', 'www', context)
  const calls = ['getBucketWebsite', 'putObject', 'deleteObject', 'headBucket', 'listObjectsV2']
  _stubWithSuccess(context, aws._s3, calls, { Contents: [
    { Key: 'images/image.png',
      LastModified: '2018-01-23T14:08:36.000Z',
      ETag: 'b718c2d5e7e8cb3eb529b03402abebad',
      Size: 1559808,
      StorageClass: 'STANDARD' },
    { Key: 'test.js',
      LastModified: '2018-01-23T14:08:36.000Z',
      ETag: 'd41d8cd98f00b204e9800998ecf8427e',
      Size: 10,
      StorageClass: 'STANDARD' },
    { Key: 'text.json',
      LastModified: '2018-01-23T14:08:36.000Z',
      ETag: '8a80554c91d9fca8acb82f023de02f12',
      Size: 3,
      StorageClass: 'STANDARD' }
  ]})

  savor.promiseShouldSucceed(new Bucket({ name: 'test-bucket', site: true, dir: 'www' }).update(), done, (bucket) => {
    context.expect(bucket.name).to.equal('test-bucket')
    _unstub(aws._s3, calls)
  })
})

.run('Bucket')
