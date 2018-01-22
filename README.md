<p align="center">
<img src="https://raw.githubusercontent.com/idancali/awsome/master/logo.png" width="256px">
</p>

<h1 align="center"> AWSome
<img src="https://img.shields.io/npm/v/awsome.svg"/>
</h1>

<h3 align="center"> AWS Object Management Environment </h3>
<p align="center"> Manage your AWS infrastructure as if it were composed of plain objects.
</p>
<hr/>

## Upcoming Release (0.3) [![Build](https://circleci.com/gh/idancali/awsome.svg?style=svg)](https://circleci.com/gh/idancali/awsome)

[![Coverage](https://api.codeclimate.com/v1/badges/312e1b5f300ce41ce86f/test_coverage)](https://codeclimate.com/github/idancali/awsome/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/312e1b5f300ce41ce86f/maintainability)](https://codeclimate.com/github/idancali/awsome/maintainability)
[![Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![Issues](https://img.shields.io/github/issues-raw/fluidtrends/awsome.svg)](https://github.com/fluidtrends/awsome/projects/1)

## Getting Started

Make your AWS credentials available in the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables and then just import AWSome to get started.

```
// Import AWSome
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

We'd be glad to have you join us as an AWSome Contributor. Get started by reading our Contributor Guide.

[Read The Contributor Guide](/contrib)

## Dependencies

AWSome makes use of the following libraries:

* [aws sdk](https://github.com/aws/aws-sdk-js) - for AWS calls
* [cross-env](https://github.com/kentcdodds/cross-env) - for running examples
* [savor](https://github.com/fluidtrends/savor) - for testing

## License

AWSome is licensed under the MIT License.

* [Read The License](LICENSE)

## Sponsors

AWSome is sponsored by [Fluid Trends](http://fluidtrends.com) and is part of the Fluid Trends Open Source Lab.

If you'd like to co-sponsor this project, shoot us email at **team at fluidtrends.com**
