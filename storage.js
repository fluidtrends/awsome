var path       = require('path');
var fs         = require('fs-extra');
var zlib       = require('zlib');
var walk       = require('walk');
var fstream    = require('fstream');
var crypto     = require('crypto');
var coreutils  = require('coreutils');
var AWS        = require('aws-sdk');
var logger     = coreutils.logger;

var storage = {

  defaultRegion: 'us-east-1',

  encrypter: function (algo) {
    return crypto.createHash(algo);
  },

  md5: function(clearText) {
    return storage.encrypter('md5').update(clearText).digest('base64');
  },

  websiteBucketUrl: function (domain, region) {
    return domain + ".s3-website-" + region + ".amazonaws.com";
  },

  hasWebsite: function (domain, success, error) {
    var s3 = new AWS.S3();
    var params = { Bucket: domain };
    s3.getBucketWebsite(params, function(err, data) {
      if (err && err.code === 'NoSuchBucket') {
        error (err);
        return;
      }
      success();
    });
  },

  configureWebsite: function(domain, success, error) {
    var s3 = new AWS.S3();

    logger.info("Configuring bucket for web hosting");
    var params = {
      Bucket: domain,
      WebsiteConfiguration: {
        IndexDocument: {
          Suffix: 'index.html'
        }
      }
    };
    s3.putBucketWebsite(params, function(err, data) {
      if (err) {
        error(err);
        return;
      }
      logger.ok("Bucket configured for web hosting");
      success();
    });
  },

  addWebsite: function (domain, success, error) {
     var s3 = new AWS.S3();
     logger.info("Adding website bucket for " + domain);

     var policy = {Version: "2008-10-17", Statement: [{
       Sid: "Allow Public Access to All Objects",
       Effect: "Allow",
       Principal: {AWS: "*"},
			 Action: "s3:GetObject",
			 Resource: "arn:aws:s3:::" + domain + "/*"
     }]};
     policy = JSON.stringify(policy);

      s3.createBucket({
        Bucket: domain
      }, function(err, data) {
        if (err) {
          error(err);
          return;
        }
        logger.ok("Website bucket added for " + domain);
        logger.info("Setting bucket policy");
        var params = { Bucket: domain, Policy: policy };
        s3.putBucketPolicy(params, function(err, data) {
          if (err) {
            error(err);
            return;
          }
          logger.ok("Bucket policy set successfully");
          storage.configureWebsite(domain, success, error);
        });

      });
  },

  uploadAsset: function (domain, asset, success, error) {
    var s3 = new AWS.S3();
    var content = fs.readFileSync(asset.path);
    var hash = storage.md5(content);
    s3.putObject({
      Bucket: domain,
      Key: asset.key,
      Body: content,
      ContentType: asset.meta,
      ContentMD5: hash
    }, function(err, response) {
      if (err) {
        error(err);
        return;
      }
      success(response);
    });
  },

  removeAsset: function (domain, asset, success, error) {
    var s3 = new AWS.S3();
    s3.deleteObject({
      Bucket: domain,
      Key: asset.key
    }, function(err, response) {
      if (err) {
        error(err);
        return;
      }
      success(response);
    });
  },

  remoteAssets: function(domain, success, error){
    var s3 = new AWS.S3();
    var params = {
      Bucket: domain
    };
    s3.listObjects(params, function(err, data) {
      if (err) {
        error(err);
        return;
      }
      if (!data || !data.Contents) {
        error("No assets");
        return;
      }
      success(data.Contents);
    });
  },

  markAssetsForUpload: function(localAssets, remoteAssets) {
    var marked = [];
    if (!remoteAssets || remoteAssets.length <= 0) {
      localAssets.forEach(function(localAsset) {
          localAsset.action = "upload";
          marked.push(localAsset);
      });
      return marked;
    }

    remoteAssets.forEach(function(remoteAsset) {
      remoteAsset.ETag = remoteAsset.ETag.replace(/"/g,'');
      var removed = true;
      localAssets.forEach(function(localAsset) {
        if (remoteAsset.Key === localAsset.key) {
          removed = false;
          localAsset.action = ((remoteAsset.ETag === localAsset.etag) ? "skip" : "upload");
          marked.push(localAsset);
          return;
        }
      });
      if (removed) {
        marked.push({etag: remoteAsset.ETag, action: "remove", key: remoteAsset.Key});
      }
    });
    return marked;
  },

  upload: function (domain, dir, success, error) {
    storage.remoteAssets(domain, function(remoteAssets) {
      storage.compileUploadList(dir, function(localAssets) {
        var markedAssets = storage.markAssetsForUpload(localAssets, remoteAssets, domain);
        var total = markedAssets.length;

        markedAssets.forEach(function(asset){
          if (asset.action === 'remove') {
            storage.removeAsset(domain, asset, function(){
               logger.ok("[REMOVE] " + asset.key);
               if (total-- <= 1) success();
             }, function(err) {
               logger.fail("[REMOVE] " + asset.key);
               if (total-- <= 1) success();
             });
          }
          else if (asset.action === 'upload') {
            storage.uploadAsset(domain, asset, function(){
               logger.ok("[UPLOAD] " + asset.key);
               if (total-- <= 1) success();
             }, function(err) {
               logger.fail("[UPLOAD] " + asset.key);
               if (total-- <= 1) success();
             });
          }
          else if (asset.action === 'skip') {
            logger.skip("[UPLOAD] " + asset.key);
            if (total-- <= 1) success();
          }
        });
      }, error);
    }, error);
  },

  compileUploadList: function (rootDir, success, error) {
    var assets      = [];
    var walker      = walk.walk(rootDir, { followLinks: false });
    walker.on('file', function(root, stat, next) {
        var filepath = root + '/' + stat.name;
        var key = filepath.substring(rootDir.length + 1)
        var meta = coreutils.contentType(path.basename(key));
        var content = fs.readFileSync(filepath);
        var hash = storage.md5(content);
        var etag = new Buffer(hash, 'base64').toString('hex');
        assets.push({meta: meta, key: key, path: filepath, hash: hash, etag: etag});

        next();
    });
    walker.on('end', function() {
      success(assets);
    });
  }

}

module.exports = storage;
