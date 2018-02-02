const awsome = require('..')

const domain = new awsome.Domain({
  name: 'data.fluidtrends.com'
})

module.exports = () => domain.host()
                             .then((domain) => console.log(domain))
