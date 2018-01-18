## The Bucket Documentation

The Bucket object allows you manage your S3 buckets, including site buckets.

### Instantiation

To use the Bucket you start by instantiating an instance, with some options.

*Examples:*

```
// Import AWSOME
const awsome = require('awsome')

// Instantiate a regular bucket
const bucket = new awsome.Bucket({
  name: 'my-test-bucket'
})

// Instantiate a site bucket
const bucket = new awsome.Bucket({
  name: 'www.mydomain.com',
  site: true
})

// Instantiate a redirected site bucket
const bucket = new awsome.Bucket({
  name: 'www.mydomain.com',
  site: {
    redirectTo: 'mydomain.com'
  }
})

```

[See all the available options](#options)

### Functions

**```exists()```**
*Returns a Promise*

Checks whether the bucket exists or not.

*Example:*

```
bucket.exists()
      .then(() => {
        // The bucket exists
      })
      .catch(() => {
        // The bucket does not exist
      })
```

**```create()```**
*Returns a Promise*

Creates a brand new bucket, unless it already exists.

*Example:*

```
bucket.create()
      .then((bucket) => {
        // The bucket now exists
      })
      .catch((error) => {
        // The bucket was not created
      })
```

**```retrieve()```**
*Returns a Promise*

Retrieves the bucket data, if the bucket exists.

*Example:*

```
bucket.retrieve()
      .then((bucket) => {
        // The bucket.data is now available
      })
      .catch((error) => {
        // The bucket data could not be retrieved
      })
```


**```delete()```**
*Returns a Promise*

Deletes the entire bucket, if it exists.

*Example:*

```
bucket.delete()
      .then(() => {
        // The bucket is now deleted
      })
      .catch((error) => {
        // The bucket data could not be deleted
      })
```

### Fields

**```name```**

The name of the bucket that was passed through the ***name*** option.

**```data```**

The bucket data that was previously retrieved using the ***retrieve()*** function, or undefined if the bucket has no data.

**```options```**

The options that were initially passed in when this bucket was instantiated.

**```site```**

The site options that were initially passed in when this bucket was instantiated.

**```siteInfo```**

The site information that were retrieved after a ***retrieve()*** or a ***create()*** operation.

### Options

**```name```** (*Required*)
*type: String*

The name of the bucket.

*Examples:*

- ```my-test-bucket```
- ```www.mydomain.com```
- ```domain.com```

**```site```**
*type: String or Object*

This option holds site-related options. If this option is not present, the bucket is treated as a regular bucket. Otherwise, the bucket is treated as a site bucket.

*Examples:*

- ```false``` makes this a regular bucket
- ```true``` for a simple site bucket
- ```{ redirectTo: 'another bucket' }``` a redirected site bucket
