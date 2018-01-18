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

## Basic Usage

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

## Dependencies

AWSOME makes use of the following libraries:

* [aws sdk](https://github.com/aws/aws-sdk-js) - for AWS calls
* [savor](https://github.com/fluidtrends/savor) - for testing

## License

AWSOME is licensed under the MIT License.

* [Read The License](LICENSE)

## Sponsors

AWSOME is sponsored by [Fluid Trends](http://fluidtrends.com).

If you'd like to co-sponsor this project, shoot us email at **team at fluidtrends.com**
