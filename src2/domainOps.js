const fs = require('fs-extra')
const walk = require('walk')
const aws = require('../lib/aws')
const utils = require('./utils')
const path = require('path')

function _isHosted (domain) {
  return aws.route53('listHostedZones', {}).then((data) => {
    if (!data.HostedZones || data.HostedZones.length === 0) {
      throw new Error('No hosted zones available')
    }

    var found = false
    data.HostedZones.forEach((zone) => {
      if (zone.Name === `${domain.name}.`) {
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

const operations = (domain) => ({
  isHosted: () => _isHosted(domain),
  host: () => _host(domain),
  unhost: () => _unhost(domain)
})

module.exports = operations
