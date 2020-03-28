const savor = require('savor')
const Domain = savor.src('Domain')
const aws = savor.src('../lib/aws')

function _stubWithSuccess (context, service, calls, data) {
  calls.map(call => context.stub(service, call).callsFake((options, callback) => callback(null, data)))
}

function _stubWithError (context, service, calls, error) {
  calls.map(call => context.stub(service, call).callsFake((options, callback) => callback(error)))
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
    { Id: 'id',
      Name: 'test-domain.',
      CallerReference: 'test',
      Config: {},
      ResourceRecordSetCount: 1 }
  ] })

  savor.promiseShouldSucceed(new Domain({ name: 'test-domain' }).isHosted(), done, (domain) => {
    context.expect(domain.id).to.not.exist
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

.add('detect that a domain does not have a linked bucket when there are no records', (context, done) => {
  const calls = ['listHostedZones', 'listResourceRecordSets']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test.domain.',
      CallerReference: 'test.domain'
    }]
  })

  savor.promiseShouldFail(new Domain({ name: 'test.domain' }).isBucketLinked(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('detect that a domain does not have a linked bucket when the record is missing', (context, done) => {
  const calls = ['listHostedZones', 'listResourceRecordSets']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test.domain.',
      CallerReference: 'test.domain'
    }],
    ResourceRecordSets:
    [{ Name: 'test.domain2.',
      Type: 'A',
      ResourceRecords: []
    }]
  })

  savor.promiseShouldFail(new Domain({ name: 'test.domain' }).isBucketLinked(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('detect that a domain does not have a linked bucket when the record type is missing', (context, done) => {
  const calls = ['listHostedZones', 'listResourceRecordSets']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test.domain.',
      CallerReference: 'test.domain'
    }],
    ResourceRecordSets:
    [{ Name: 'test.domain.',
      Type: 'B',
      ResourceRecords: []
    }]
  })

  savor.promiseShouldFail(new Domain({ name: 'test.domain' }).isBucketLinked(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('detect that a domain has no linked bucket even though it has a corrupt record', (context, done) => {
  const calls = ['listHostedZones', 'listResourceRecordSets']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test.domain.',
      CallerReference: 'test.domain'
    }],
    ResourceRecordSets:
    [{ Name: 'test.domain.',
      Type: 'A'
    }]
  })

  savor.promiseShouldFail(new Domain({ name: 'test.domain' }).isBucketLinked(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('detect that a domain has a linked bucket', (context, done) => {
  const calls = ['listHostedZones', 'listResourceRecordSets']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test.domain.',
      CallerReference: 'test.domain'
    }],
    ResourceRecordSets:
    [{ Name: 'test.domain.',
      Type: 'A',
      ResourceRecords: [],
      AliasTarget: { DNSName: 'test.domain2.s3-website-us-east-1.amazonaws.com.' }
    },
    { Name: 'test.domain.',
      Type: 'A',
      ResourceRecords: [],
      AliasTarget: { DNSName: 'test.domain.s3-website-us-east-1.amazonaws.com.' }
    }]
  })

  savor.promiseShouldSucceed(new Domain({ name: 'test.domain' }).isBucketLinked(), done, (domain) => {
    context.expect(domain).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('do not link a bucket to a hosted domain if it is alreay linked', (context, done) => {
  const calls = ['listHostedZones', 'listResourceRecordSets', 'changeResourceRecordSets']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test.domain.',
      CallerReference: 'test.domain'
    }],
    ResourceRecordSets:
    [{ Name: 'test.domain.',
      Type: 'A',
      ResourceRecords: [],
      AliasTarget: { DNSName: 's3-website-us-east-1.amazonaws.com.' }
    }]
  })

  savor.promiseShouldFail(new Domain({ name: 'test.domain' }).linkBucket(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('link a bucket to a hosted domain', (context, done) => {
  const calls = ['listHostedZones', 'listResourceRecordSets', 'changeResourceRecordSets']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test.domain.',
      CallerReference: 'test.domain'
    }],
    ResourceRecordSets: []
  })

  savor.promiseShouldSucceed(new Domain({ name: 'test.domain' }).linkBucket(), done, (domain) => {
    context.expect(domain).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('do not unlink a bucket from a hosted domain if it is not linked already', (context, done) => {
  const calls = ['listHostedZones', 'listResourceRecordSets', 'changeResourceRecordSets']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test.domain.',
      CallerReference: 'test.domain'
    }],
    ResourceRecordSets: []
  })

  savor.promiseShouldFail(new Domain({ name: 'test.domain' }).unlinkBucket(), done, (error) => {
    context.expect(error).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('unlink a bucket from a hosted domain', (context, done) => {
  const calls = ['listHostedZones', 'listResourceRecordSets', 'changeResourceRecordSets']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test.domain.',
      CallerReference: 'test.domain'
    }],
    ResourceRecordSets: [{ Name: 'test.domain.',
      Type: 'A',
      ResourceRecords: [],
      AliasTarget: { DNSName: 's3-website-us-east-1.amazonaws.com.' }
    }]
  })

  savor.promiseShouldSucceed(new Domain({ name: 'test.domain' }).unlinkBucket(), done, (domain) => {
    context.expect(domain).to.exist
    _unstub(aws._route53, calls)
  })
})

.add('get some domain records', (context, done) => {
  const calls = ['listHostedZones', 'listResourceRecordSets']
  _stubWithSuccess(context, aws._route53, calls, { HostedZones: [
    { Id: '/hostedzone/id',
      Name: 'test.domain.',
      CallerReference: 'test.domain'
    }],
    ResourceRecordSets: [{ Name: 'test.domain.',
      Type: 'A',
      ResourceRecords: [],
      AliasTarget: { DNSName: 's3-website-us-east-1.amazonaws.com.' }
    }]
  })

  savor.promiseShouldSucceed(new Domain({ name: 'test.domain' }).records({ type: 'A' }), done, (records) => {
    context.expect(records.length).to.equal(1)
    _unstub(aws._route53, calls)
  })
})

.run('Domain')
