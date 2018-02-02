const awsome = require('..')

const domain = new awsome.Domain({
  name: 'data.fluidtrends.com'
})

module.exports = () => domain.linkBucket()
                             .then((domain) => console.log(domain))
