const savor = require('savor')
const Domain = savor.src('Domain')
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

savor.add('detect if there are no hosting zones', (context, done) => {
  const calls = ['listHostedZones']
  _stubWithSuccess(context, aws._route53, calls, {})

  savor.promiseShouldFail(new Domain({ name: 'test-domain' }).isHosted(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('detect if the domain is not hosted', (context, done) => {
  const calls = ['listHostedZones']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [] })

  savor.promiseShouldFail(new Domain({ name: 'test-domain' }).isHosted(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('detect if the domain is not part of the hosted domains', (context, done) => {
  const calls = ['listHostedZones']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test-domain2',
      CallerReference: 'test',
      Config: {},
      ResourceRecordSetCount: 1 }
  ] })

  savor.promiseShouldFail(new Domain({ name: 'test-domain' }).isHosted(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('detect if the domain is hosted', (context, done) => {
  const calls = ['listHostedZones']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test-domain.',
      CallerReference: 'test',
      Config: {},
      ResourceRecordSetCount: 1 }
  ] })

  savor.promiseShouldSucceed(new Domain({ name: 'test-domain' }).isHosted(), done, (domain) => {
    context.expect(domain.name).to.equal('test-domain')
    _unstub(aws._route53, calls)
  })
})

.add('do not host a domain that is already hosted', (context, done) => {
  const calls = ['listHostedZones']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test-domain.',
      CallerReference: 'test',
      Config: {},
      ResourceRecordSetCount: 1 }
  ] })

  savor.promiseShouldFail(new Domain({ name: 'test-domain' }).host(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('host a domain that is not already hosted', (context, done) => {
  const calls = ['listHostedZones', 'createHostedZone']
  _stubWithSuccess(context, aws._route53, calls, { HostedZone:
  { Id: '/hostedzone/id',
    Name: 'test.domain.',
    CallerReference: 'test.domain'
  }})

  savor.promiseShouldSucceed(new Domain({ name: 'test.domain' }).host(), done, (domain) => {
    context.expect(domain.name).to.equal('test.domain')
    context.expect(domain.zone).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('unhost a domain that is already hosted', (context, done) => {
  const calls = ['listHostedZones', 'createHostedZone', 'deleteHostedZone']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test.domain.',
      CallerReference: 'test.domain'
    }]})

  savor.promiseShouldSucceed(new Domain({ name: 'test.domain' }).unhost(), done, (domain) => {
    context.expect(domain.name).to.equal('test.domain')
    context.expect(domain.zone).to.not.exist
    _unstub(aws._route53, calls)
  })
})

.run('Domain')
