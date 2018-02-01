# AWSOME

AWSOME allows you to manage your AWS infrastructure programmatically, as if were composed of plain JavaScript objects.

## The Bucket Object

The Bucket object allows you manage your S3 buckets, including site buckets.

**Basic Usage**

```
// Import AWSOME
const awsome = require('awsome')

// Create a new bucket instance
const bucket = new awsome.Bucket({ name: 'my-test-bucket' })

// Fetch the bucket data
bucket.retrieve()
      .then((bucket) => {
        // Good stuff, enjoy the bucket.data
      })
      .catch((error) => {
        // Something happened and the bucket data could not be retrieved
      })
```

Read The Full Bucket Documentation for more details about creating, retrieving, updating and deleting buckets, including site buckets.

[Read The Bucket Documentation](/docs/bucket)

## The Domain Object

The Domain object allows you manage your Route53 domains, including hosted zones.

**Basic Usage**

```
// Import AWSOME
const awsome = require('awsome')

// Create a new domain instance
const domain = new awsome.Domain({ name: 'my-domain.com' })

// Host the domain
bucket.host()
      .then((domain) => {
        // Good stuff, enjoy your newly hosted domain
      })
      .catch((error) => {
        // Something happened and the domain could not be hosted
      })
```

Read The Full Domain Documentation for more details about managing your domains and your hosted zones.

[Read The Domain Documentation](/docs/domain)
