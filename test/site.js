const savor = require('savor')
const site = savor.src('site')
const aws = savor.src('../lib/aws')

savor.add('ensure an existing site bucket can be retrieved', (context, done) => {
  context.stub(aws._s3, 'getBucketWebsite', (options, callback) => callback(null, {test: 'test'}))
  savor.promiseShouldSucceed(site({ domain: 'test-site' }).getBucket(), done, (bucket) => {
    context.expect(bucket.domain).to.equal('test-site')
    aws._s3.getBucketWebsite.restore()
  })
})

.add('make sure an non-existing site bucket cannot be retrieved', (context, done) => {
  context.stub(aws._s3, 'getBucketWebsite', (options, callback) => callback(new Error('test')))
  savor.promiseShouldFail(site({ domain: 'test-site' }).getBucket(), done, (error) => {
    context.expect(error).to.exist
    aws._s3.getBucketWebsite.restore()
  })
})

.add('make sure an existing site bucket cannot be added', (context, done) => {
  context.stub(aws._s3, 'getBucketWebsite', (options, callback) => callback(null, {test: 'test'}))
  savor.promiseShouldFail(site({ domain: 'test-site' }).createBucket(), done, (error) => {
    context.expect(error).to.exist
    aws._s3.getBucketWebsite.restore()
  })
})

.add('create a new site bucket', (context, done) => {
  context.stub(aws._s3, 'getBucketWebsite', (options, callback) => callback(new Error('test')))
  context.stub(aws._s3, 'createBucket', (options, callback) => callback(null, {test: 'test'}))
  context.stub(aws._s3, 'putBucketWebsite', (options, callback) => callback(null, {test: 'test'}))
  savor.promiseShouldSucceed(site({ domain: 'test-site' }).createBucket(), done, (bucket) => {
    context.expect(bucket.domain).to.equal('test-site')
    aws._s3.getBucketWebsite.restore()
    aws._s3.createBucket.restore()
    aws._s3.putBucketWebsite.restore()
  })
})

.add('make sure a non-existing site bucket cannot be removed', (context, done) => {
  context.stub(aws._s3, 'getBucketWebsite', (options, callback) => callback(new Error('test')))
  savor.promiseShouldFail(site({ domain: 'test-site' }).removeBucket(), done, (error) => {
    context.expect(error).to.exist
    aws._s3.getBucketWebsite.restore()
  })
})

.add('remove an existing site bucket', (context, done) => {
  context.stub(aws._s3, 'getBucketWebsite', (options, callback) => callback(null, {test: 'test'}))
  context.stub(aws._s3, 'deleteBucketWebsite', (options, callback) => callback(null, {test: 'test'}))
  context.stub(aws._s3, 'deleteBucket', (options, callback) => callback(null, {test: 'test'}))
  savor.promiseShouldSucceed(site({ domain: 'test-site' }).removeBucket(), done, (bucket) => {
    context.expect(bucket.domain).to.equal('test-site')
    aws._s3.getBucketWebsite.restore()
    aws._s3.deleteBucketWebsite.restore()
    aws._s3.deleteBucket.restore()
  })
})

.run('site')
