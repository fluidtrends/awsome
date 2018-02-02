<p align="center">
<img src="https://raw.githubusercontent.com/fluidtrends/awsome/master/logo.png" width="256px">
</p>

<h1 align="center"> AWSome
<img src="https://img.shields.io/npm/v/awsome.svg"/>
</h1>

<h3 align="center"> AWS Object Management Environment </h3>
<p align="center"> Manage your AWS infrastructure as if it were composed of plain objects.
</p>
<hr/>

## Build Status [![Build](https://circleci.com/gh/fluidtrends/awsome.svg?style=svg)](https://circleci.com/gh/fluidtrends/awsome)

[![Coverage](https://api.codeclimate.com/v1/badges/bcf4dae241b12298574c/test_coverage)](https://codeclimate.com/github/fluidtrends/awsome/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/bcf4dae241b12298574c/maintainability)](https://codeclimate.com/github/fluidtrends/awsome/maintainability)
[![Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)

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

## Examples

Get started with the examples provided to **create**, **retrieve**, **update** or **delete** buckets and to **host**, **unhost** domains as well as to **link** and **unlink** domains and buckets. Make sure you have your AWS key and secret ready and then just run the example as follows:

```
node ./node_modules/awsome/examples key=<INSERT AWS KEY> secret=<INSERT AWS SECRET> example=create-bucket
```

The supported examples are:

* ```create-bucket```
* ```retrieve-bucket```
* ```update-bucket```
* ```delete-bucket```
* ```host-domain```
* ```unhost-domain```
* ```link-bucket```
* ```unlink-bucket```

[See All The Examples](/examples)

## Documentation

Read the full documentation for detailed instructions on how to create, retrieve, update and delete buckets, including site buckets, host and unhost domains and link and unlink domains and buckets.

[Read The Docs](/docs)

## Contributing

We'd be glad to have you join us as an AWSome Contributor. Get started by reading our Contributor Guide.

[Read The Contributor Guide](/contrib)

## Dependencies

AWSome makes use of the following libraries:

* [aws sdk](https://github.com/aws/aws-sdk-js) - for AWS calls
* [cross-env](https://github.com/kentcdodds/cross-env) - for running examples
* [fs-extra](https://github.com/jprichardson/node-fs-extra) - for file management
* [walk](https://github.com/Daplie/node-walk) - for file tree walking
* [uuid](https://github.com/kelektiv/node-uuid) - for generating hosted zone references
* [tldjs](https://github.com/oncletom/tld.js) - for parsing domain names
* [savor](https://github.com/fluidtrends/savor) - for testing

## License

AWSome is licensed under the MIT License.

* [Read The License](LICENSE)

## Sponsors

AWSome is sponsored by [Fluid Trends](http://fluidtrends.com) and is part of the Fluid Trends Open Source Lab.

If you'd like to co-sponsor this project, please email your co-sponsorship request to **team at fluidtrends.com**
