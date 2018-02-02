const awsome = require('..')

const bucket = new awsome.Bucket({
  name: 'www.fluidtrends.com',
  site: true
})

module.exports = () => bucket.retrieve()
                             .then((data) => console.log(data))
