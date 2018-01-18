const AWS = require('aws-sdk')

const _s3 = new AWS.S3()
// const _route53 = new AWS.Route53()
// const _route53Domains = new AWS.Route53Domains()

const s3 = (call, options) => _call(_s3, call, options)
// const route53 = (call, options) => _call(_route53, call, options)
// const route53Domains = (call, options) => _call(_route53Domains, call, options)

const _call = (service, call, options) => new Promise((resolve, reject) => {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    reject(new Error('Your AWS_ACCESS_KEY_ID is missing'))
    return
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    reject(new Error('Your AWS_SECRET_ACCESS_KEY is missing'))
    return
  }

  service[call](options, (err, data) => {
    if (err) {
      reject(err)
      return
    }
    resolve(data)
  })
})

const main = { _s3, s3 /** _route53, route53, _route53Domains, route53Domains **/}

module.exports = main
