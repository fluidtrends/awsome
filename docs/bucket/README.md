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


### Options

**name** (*Required*)
*type: String*

The name of the bucket.

*Examples:*

- ```my-test-bucket```
- ```www.mydomain.com```
- ```domain.com```

**site**
*type: String or Object*

This option holds site-related options. If this option is not present, the bucket is treated as a regular bucket. Otherwise, the bucket is treated as a site bucket.

*Examples:*

- ```false // make this a regular bucket```
- ```true // for a simple site bucket```
- ``` { redirectTo: 'another bucket' } // a redirected site bucket```
