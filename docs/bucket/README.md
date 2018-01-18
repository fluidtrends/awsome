## The Bucket Documentation

The Bucket object allows you manage your S3 buckets, including site buckets.

### Instantiation

To use the Bucket you start by instantiating an instance, with some options.

*Examples:*

```
// Instantiate a regular bucket
const bucket = new Bucket({
  name: 'my-test-bucket'
})

// Instantiate a site bucket
const bucket = new Bucket({
  name: 'www.mydomain.com',
  site: true
})

// Instantiate a redirected site bucket
const bucket = new Bucket({
  name: 'www.mydomain.com',
  site: {
    redirectTo: 'mydomain.com'
  }
})

```

[See all the available options](#options)

### Create A New Bucket

```
bucket.create().then((bucket) => {
  // Find the data under bucket.data
})
```

### Retrieve An Existing Bucket

### Update An Existing Bucket

### Delete An Existing Bucket

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
