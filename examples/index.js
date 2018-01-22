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

if (!args.example) {
  console.error('Please specify an example to run [create, delete or retrieve]')
  process.exit(0)
}

process.env.AWS_ACCESS_KEY_ID = args.key
process.env.AWS_SECRET_ACCESS_KEY = args.secret

require(`./${args.example}`)()
       .catch((error) => console.error(error))
