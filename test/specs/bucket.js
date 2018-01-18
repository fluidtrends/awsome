const savor = require('savor')
const Bucket = savor.src('Bucket')
const aws = savor.src('../lib/aws')

function _stubWithSuccess (context, service, calls, data) {
  calls.map(call => context.stub(service, call, (options, callback) => callback(null, data)))
}

function _stubWithError (context, service, calls, error) {
  calls.map(call => context.stub(service, call, (options, callback) => callback(error)))
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
  const calls = ['createBucket']
  _stubWithError(context, aws._s3, ['headBucket'], new Error('bucket does not exist'))
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })

  savor.promiseShouldSucceed(new Bucket({ name: 'test-bucket' }).create(), done, (bucket) => {
    context.expect(bucket.name).to.equal('test-bucket')
    _unstub(aws._s3, calls.concat(['headBucket']))
  })
})

.add('create a new site bucket', (context, done) => {
  const calls = ['putBucketWebsite', 'createBucket', 'getBucketWebsite']
  _stubWithError(context, aws._s3, ['headBucket'], new Error('bucket does not exist'))
  _stubWithSuccess(context, aws._s3, calls, { test: 'test' })

  savor.promiseShouldSucceed(new Bucket({ name: 'test-bucket', site: true }).create(), done, (bucket) => {
    context.expect(bucket.name).to.equal('test-bucket')
    _unstub(aws._s3, calls.concat(['headBucket']))
  })
})

.add('create a new redirected site bucket', (context, done) => {
  const calls = ['putBucketWebsite', 'createBucket', 'getBucketWebsite']
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

.run('Bucket')
