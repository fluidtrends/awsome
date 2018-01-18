const awsome = require('..')

var args = {}
process.argv.slice(3).map(a => args = Object.assign({}, args, { [a.split('=')[0]]: a.split('=')[1] }))

if (!args.key) {
  console.error('Your AWS key is missing')
  process.exit(0)
}

if (!args.secret) {
  console.error('Your AWS secret is missing')
  process.exit(0)
}

if (!args.bucket) {
  console.error('Your AWS bucket name is missing')
  process.exit(0)
}

process.env.AWS_ACCESS_KEY_ID = args.key
process.env.AWS_SECRET_ACCESS_KEY = args.secret

const bucket = new awsome.Bucket({ name: args.bucket })

console.log(`Fetching data for bucket ${args.bucket} ...`)

bucket.retrieve()
      .then((bucket) => {
        console.log(`Found ${bucket.data.Contents.length} objects in your ${args.bucket} bucket.`)
      })
      .catch((error) => console.error(error))
