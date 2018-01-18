const savor = require('savor')
const domain = savor.src('domain')
const aws = savor.src('../lib/aws')

savor.add('check if a domain is available', (context, done) => {
  context.stub(aws._route53Domains, 'checkDomainAvailability', (options, callback) => callback(null, {test: 'test'}))
  savor.promiseShouldSucceed(domain({ name: 'test-domain' }).checkAvailability(), done, (domain) => {
    context.expect(domain.name).to.equal('test-domain')
    aws._route53Domains.checkDomainAvailability.restore()
  })
})

.run('domain')
