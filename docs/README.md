# AWSOME

AWSOME allows you to manage your AWS infrastructure programmatically, as if were composed of plain JavaScript objects.

## Bucket

The Bucket object allows you manage your S3 buckets, including site buckets.

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
