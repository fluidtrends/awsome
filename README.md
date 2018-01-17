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
// Import AWSOME with default options
const awsome = require('awsome')
```

## Core API

### site(options)

Creates a reference to a site object, identified by the domain specified in options.domain

**Example:**

```
const site = awsome.site({ domain: 'some domain goes here'})
```

## Site API

### getBucket()

*Returns a promise*

Fetches the site bucket information

**Example:**

```
site.getBucket()
.then((bucket) => {
  // Bucket information is now available
})
.catch((error) => {
  // Something went wrong and the info could not fetched
})
```

### removeBucket()

*Returns a promise*

Removes the site bucket completely

**Example:**

```
site.removeBucket()
.then(() => {
  // The site bucket was successfully removed
})
.catch((error) => {
  // Something went wrong and the site bucket could not be removed
})
```

### createBucket()

*Returns a promise*

Creates a brand new site bucket

**Example:**

```
site.createBucket()
.then(() => {
  // The site bucket was successfully created
})
.catch((error) => {
  // Something went wrong and the site bucket could not be created
})
```

## Dependencies

AWSOME makes use of the following libraries:

* [aws sdk](https://github.com/aws/aws-sdk-js) - for AWS calls
