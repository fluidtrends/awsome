## Overview

**awsome** makes complex devops tasks as easy as humanly possible

## Installation

```
$ npm install awsome
```

## Usage

```js
var awsome = require('awsome');
```

## API

### Static Site Deployment

```js
awsome.website.deploy('./wwwroot', 'mydomain.com');
```

### Server Creation

```js
server.create('myserver', function(err, server) {
  // Enjoy your new server
});
```

### Server Provisioning

```js
server.provision('myserver', function(err) {
  // Your server is now provisioned
});
```

## Configuration

**awsome** stores its configuration data such as AWS credentials in **$HOME/.awsome/**.
When you start off, you need to have your AWS Key and Secret handy so you can pass them in at the prompt.
**awsome** will ask you to enter your AWS credentials once and then you can forget about them.

## Services

To host static websites, **awsome** makes use of AWS S3 and Route53 services. If you're hosting a subdomain, you will only
use up one bucket (for example api.mydomain.com) whereas if you're hosting an APEX domain (for example mydomain.com) then
**awsome** will create two buckets, one for **www.mydomain.com** and another for **mydomain.com**. But not to worry, you will
only use up one bucket to store contents, the second one will simply redirect to the first one.

## Smart uploading

When uploading files, **awsome** is smart enough to keep your local assets and your remote assets perfectly synced. In addition
to that, assets that have not changed will be skipped and will not be re-uploaded.

## License

MIT © [Dan Calinescu](http://dancali.io)
