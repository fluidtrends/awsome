const awsome = require('..')

const domain = new awsome.Domain({
  name: 'data.fluidtrends.com'
})

module.exports = () => domain.unlinkBucket()
                             .then((domain) => console.log(domain))
