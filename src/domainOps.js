const fs = require('fs-extra')
const walk = require('walk')
const aws = require('../lib/aws')
const utils = require('./utils')
const path = require('path')

function _isHosted (domain, onlyTLD) {
  return aws.route53('listHostedZones', {}).then((data) => {
    if (!data.HostedZones || data.HostedZones.length === 0) {
      throw new Error('No hosted zones available')
    }

    var found = false
    const domainMeta = utils.parseDomain(domain.name)
    const domainName = onlyTLD ? domainMeta.domain : domain.name

    data.HostedZones.forEach((zone) => {
      if (zone.Name === `${domainName}.`) {
        found = true
        domain._id = zone.Id
        domain._ref = zone.CallerReference
        domain._zone = Object.assign({}, zone)
      }
    })

    if (!found) {
      throw new Error('The domain has no hosted zone')
    }

    return domain
  })
}

function _host (domain) {
  domain._ref = utils.newId()

  return aws.route53('createHostedZone', {
    CallerReference: domain.ref,
    Name: domain.name
  }).then((data) => {
    domain._zone = Object.assign({}, data.HostedZone)
    return domain
  })
}

function _unhost (domain) {
  return aws.route53('deleteHostedZone', {
    Id: domain.id
  }).then((data) => {
    domain._zone = null
    return domain
  })
}

function _getRecords (domain, filter) {
  return aws.route53('listResourceRecordSets', { HostedZoneId: domain.id })
              .then((data) => {
                if (!data.ResourceRecordSets || data.ResourceRecordSets.length === 0) {
                  return Promise.reject(new Error('This zone has no record sets'))
                }
                var matches = []
                data.ResourceRecordSets.forEach((record) => {
                  if (record.Name === `${domain.name}.` && (!filter || !filter.type ||
                     (filter.type === record.Type))) {
                    matches.push(Object.assign({}, record))
                  }
                })
                return Promise.resolve(matches)
              })
}

function _status(domain) {
  var result = {}
  return Promise.all([new Promise((resolve, reject) => {
    aws.route53Domains('checkDomainAvailability', { DomainName: domain.name })
       .then((data) => {
         resolve({ id: 'availability', available: data.Availability === 'AVAILABLE' || false })
       })
       .catch((error) => {
         resolve({ id: 'availability', errorCode: error.code, errorMessage: error.message })
       })
  }),
  new Promise((resolve, reject) => {
    aws.route53Domains('getDomainDetail', { DomainName: domain.name })
       .then((data) => {
         resolve({ id: 'listing', data })
       })
       .catch((error) => {
         resolve({ id: 'listing', errorCode: error.code, errorMessage: error.message })
       })
  })])
  .then((items) => {
    items.map((item) => result[item.id] = item)
    return result
  })
}

function _isBucketLinked (domain) {
  return _getRecords(domain, { type: 'A' }).then((records) => {
    if (!records || records.length === 0) {
      throw new Error('There are no records')
    }
    var found = false
    records.forEach((record) => {
      if (record.AliasTarget && record.AliasTarget.DNSName) {
        found = true
      }
    })
    if (!found) {
      throw new Error('The bucket record was not found')
    }
  })
}

function _register(domain, contact) {

}

function _listAll(domain, contact) {

}

function _linkBucket (domain) {
  return aws.route53('changeResourceRecordSets', {
    ChangeBatch: {
      Changes: [
        {
          Action: 'CREATE',
          ResourceRecordSet: {
            AliasTarget: {
              DNSName: `s3-website-us-east-1.amazonaws.com`,
              EvaluateTargetHealth: false,
              HostedZoneId: 'Z3AQBSTGFYJSTF'
            },
            Name: domain.name,
            Type: 'A'
          }
        }
      ],
      Comment: ''
    },
    HostedZoneId: domain.id
  })
  .then((data) => domain)
}

function _unlinkBucket (domain) {
  return aws.route53('changeResourceRecordSets', {
    ChangeBatch: {
      Changes: [
        {
          Action: 'DELETE',
          ResourceRecordSet: {
            AliasTarget: {
              DNSName: `s3-website-us-east-1.amazonaws.com`,
              EvaluateTargetHealth: false,
              HostedZoneId: 'Z3AQBSTGFYJSTF'
            },
            Name: domain.name,
            Type: 'A'
          }
        }
      ],
      Comment: ''
    },
    HostedZoneId: domain.id
  })
  .then((data) => domain)
}

const operations = (domain) => ({
  isHosted: (onlyTLD) => _isHosted(domain, onlyTLD),
  status: () => _status(domain),
  host: () => _host(domain),
  unhost: () => _unhost(domain),
  getRecords: (filter) => _getRecords(domain, filter),
  isBucketLinked: () => _isBucketLinked(domain),
  unlinkBucket: () => _unlinkBucket(domain),
  register: () => _register(domain),
  linkBucket: () => _linkBucket(domain)
})

module.exports = operations
