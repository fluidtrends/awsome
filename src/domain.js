const aws = require('../lib/aws')

const _domain = (options) => ({
  name: options.name,
  options,
  checkAvailability: () => _checkAvailability(options)
})

function _checkAvailability (options) {
  return _route53Domains('checkDomainAvailability', options, { DomainName: options.name })
}

function _route53Domains (call, options, raw) {
  return aws.route53Domains(call, raw).then(() => _domain(options))
}

module.exports = _domain
