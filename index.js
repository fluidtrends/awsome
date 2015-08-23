var fs         = require('fs-extra');
var coreutils  = require('coreutils');
var AWS        = require('aws-sdk');
var dns        = require('./dns');
var storage    = require('./storage');
var logger     = coreutils.logger;

function prepareWebsite(domain, success, error) {
  storage.hasWebsite(domain, function() {
    logger.ok("Website bucket exists for " + domain);
    success();
  }, function(err) {
    storage.addWebsite(domain, function() {
      success();
    }, error);
  });
}

function prepareDomain(domain, success, error) {
  dns.hasDomain(domain, function(zone) {
    logger.ok("Domain exists " + domain);
    success(zone);
  }, function(err) {
     dns.addDomain(domain, function(zone) {
       logger.ok("Domain added " + domain);
       success(zone);
     }, error);
  });
}

function prepareRecord(domain, zone, success, error) {
  dns.records(zone, function(records){
    if (dns.hasRecord(records, domain)) {
      logger.ok("Record exists for " + domain);
      success(zone);
    } else {
      dns.addRecord(domain, zone, function() {
        logger.ok("Added record for " + domain);
        success(zone);
      }, error);
    }
  }, error);
}

function doPublish(domain, dir, start, done, error) {
  var parts         = domain.split('.')
  var coreDomain    = parts[parts.length - 2] + "." + parts[parts.length - 1];

  prepareWebsite(domain, function() {
    prepareDomain(coreDomain, function(zone) {
      prepareRecord(domain, zone, function(zone) {
         start();
         storage.upload(domain, dir, function() {
           done();
         }, error);
      }, error);
    }, error);
  }, error);
}

var main = {
  publish: function (domain, dir, file) {
    if (!fs.existsSync(file)) {
      logger.error("Cannot publish. Looks like your AWS credentials are missing.")
    }
    AWS.config.loadFromPath(file);

    logger.header("start publishing");

    logger.info("Preparing to upload");
    doPublish(domain, dir, function() {
      logger.info("Start uploading");
    }, function(){
      logger.footer("Done publishing");
    }, function(error) {
      logger.error(error);
    });
  }
}

module.exports = main;
