## The Domain Documentation

The Domain object allows you manage your Route53 domains, including hosted zones.

### Instantiation

To use the Domain you start by instantiating an instance, with some options.

*Examples:*

```
// Import AWSOME
const awsome = require('awsome')

// Instantiate a domain
const domain = new awsome.Domain({
  name: 'my-test-domain.com'
})

// Host the domain
bucket.host()
      .then((domain) => {
        // Good stuff, enjoy your newly hosted domain
      })
      .catch((error) => {
        // Something happened and the domain could not be hosted
      })

```

[See all the available options](#options)

### Functions

**```isHosted(onlyTLD)```**
*Returns a Promise*

Checks whether the domain is hosted or not. Specify ```onlyTLD=true``` to look at the TLD only, otherwise, an exact match is searched. The default is ```false```.

*Example:*

```
bucket.isHosted()
      .then((domain) => {
        // The domain is hosted
      })
      .catch(() => {
        // The domain is not hosted
      })
```

**```host()```**
*Returns a Promise*

Host the domain by generating a hosted zone.

*Example:*

```
bucket.host()
      .then((domain) => {
        // The domain is now hosted
      })
      .catch((error) => {
        // The domain could not be hosted
      })
```

**```unhost()```**
*Returns a Promise*

Unhost a domain that is already hosted.

*Example:*

```
bucket.unhost()
      .then((domain) => {
        // The domain is not hosted anymore
      })
      .catch((error) => {
        // The domain could not be unhosted
      })
```

**```records(filter)```**
*Returns a Promise*

Fetch a list of records for the hosted zone and specify a filter to narrow results.

*Example:*

```
bucket.records({ type: 'A' })
      .then((records) => {
        // Gets all A records
      })
      .catch((error) => {
        // The records could not be retrieved
      })
```

**```isBucketLinked()```**
*Returns a Promise*

Check whether this domain has an S3 bucket linked for hosting.

*Example:*

```
bucket.isBucketLinked()
      .then((domain) => {
        // This domain has a bucket linked to it
      })
      .catch((error) => {
        // The domain does not have a linked bucket
      })
```

**```linkBucket()```**
*Returns a Promise*

Link an S3 Bucket to this domain.

*Example:*

```
bucket.linkBucket()
      .then((domain) => {
        // This domain has a bucket linked to it now
      })
      .catch((error) => {
        // The domain and the bucket could not b linked
      })
```

**```unlinkBucket()```**
*Returns a Promise*

Remove the link between an S3 Bucket and this domain.

*Example:*

```
bucket.unlinkBucket()
      .then((domain) => {
        // This domain does not have a bucket linked to it anymore
      })
      .catch((error) => {
        // The domain and the bucket link could not be removed
      })
```


### Fields

**```name```**

The name of the domain that was passed through the ***name*** option.

**```zone```**

The associated hosted zone for this domain

**```options```**

The options that were initially passed in when this domain was instantiated.

**```ref```**

The reference id of the hosted zone.

**```id```**

The full id of the hosted zone.

### Options

**```name```** (*Required*)
*type: String*

The name of the domain.

*Examples:*

- ```my-test-domain.com```
- ```www.mydomain.com```
- ```docs.mydomain.com```
