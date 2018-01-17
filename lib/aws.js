const AWS = require('aws-sdk')
const _s3 = new AWS.S3()

const s3 = (call, options) => new Promise((resolve, reject) => {
  _s3[call](options, (err, data) => {
    if (err) {
      reject(err)
      return
    }
    resolve(data)
  })
})

const main = { _s3, s3 }

module.exports = main
