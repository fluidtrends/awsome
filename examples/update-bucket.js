const awsome = require('..')

const bucket = new awsome.Bucket({
  name: 'www.fluidtrends.com',
  site: true,
  dir: 'www'
})

module.exports = () => bucket.update()
                             .then((data) => console.log(data))
