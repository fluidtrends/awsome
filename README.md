<p align="center">
<img src="https://raw.githubusercontent.com/idancali/awsome/master/logo.png" width="256px">
</p>

<h1 align="center"> AWSOME </h1>
<h3 align="center"> AWS Object Management Environment </h3>
<p align="center"> Manage your AWS infrastructure as if it were composed of plain objects.
</p>
<hr/>

## Latest Release [![Build](https://circleci.com/gh/idancali/awsome.svg?style=svg)](https://circleci.com/gh/idancali/awsome)
[![Module](https://img.shields.io/npm/v/awsome.svg)](https://www.npmjs.com/package/awsome)
[![Coverage](https://api.codeclimate.com/v1/badges/312e1b5f300ce41ce86f/test_coverage)](https://codeclimate.com/github/idancali/awsome/test_coverage)
[![Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

## Getting Started

Make your AWS credentials available in the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables and then just import AWSOME to get started.

```
// Import AWSOME
const awsome = require('awsome')

// Create a new bucket instance
const bucket = new awsome.Bucket({ name: 'my-test-bucket' })

// Fetch the bucket data
bucket.retrieve()
      .then((data) => {
        // Good stuff, enjoy the data
      })
      .catch((error) => {
        // Something happened and the bucket data could not be retrieved
      })
```

## Documentation

Read the full documentation for detailed instructions on how to create, retrieve, update and delete buckets, including site buckets.

[Read The Docs](/docs)

## Contributing

We'd be glad to have you join us as an AWSOME Contributor. Get started by reading our Contributor Guide.

[Read The Contributor Guide](/contrib)

## Dependencies

AWSOME makes use of the following libraries:

* [aws sdk](https://github.com/aws/aws-sdk-js) - for AWS calls
* [cross-env](https://github.com/kentcdodds/cross-env) - for running examples
* [savor](https://github.com/fluidtrends/savor) - for testing

## License

AWSOME is licensed under the MIT License.

* [Read The License](LICENSE)

## Sponsors

AWSOME is sponsored by [Fluid Trends](http://fluidtrends.com) and is part of the Fluid Trends Open Source Lab.

If you'd like to co-sponsor this project, shoot us email at **team at fluidtrends.com**
