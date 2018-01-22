const awsome = require('..')

const bucket = new awsome.Bucket({
  name: 'www.fluidtrends.com',
  site: true
})

module.exports = () => bucket.delete()
                             .then(() => console.log('Deleted bucket successfully'))
