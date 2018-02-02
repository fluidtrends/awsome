const awsome = require('..')

const plainBucket = new awsome.Bucket({
  name: 'file-bucket'
})

const siteBucket = new awsome.Bucket({
  name: 'www.fluidtrends.com',
  site: true
})

const redirectBucket = new awsome.Bucket({
  name: 'fluidtrends.com',
  site: {
    redirectTo: 'www.fluidtrends.com'
  }
})

module.exports = () => Promise.all([plainBucket.create(), siteBucket.create(), redirectBucket.create()])
                              .then(() => console.log('Created all buckets successfully'))
