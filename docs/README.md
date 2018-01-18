# AWSOME

AWSOME allows you to manage your AWS infrastructure programmatically, as if were composed of plain JavaScript objects.

## The Bucket Object

The Bucket object allows you manage your S3 buckets, including site buckets.

**Basic Usage**

```
// Import AWSOME
const awsome = require('awsome')

// Create a new bucket instance
const bucket = new Bucket({ name: 'my-test-bucket' })

// Fetch the bucket data
bucket.retrieve()
      .then((data) => {
        // Good stuff, enjoy the data
      })
      .catch((error) => {
        // Something happened and the bucket data could not be retrieved
      })
```

Read The Full Bucket Documentation for more details about creating, retrieving, updating and deleting buckets, including site buckets.

[Read The Bucket Documentation](bucket)
