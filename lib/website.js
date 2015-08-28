var dns        = require('./dns');
var storage    = require('./storage');
var logger     = require('coreutils').logger;
var config     = require('./config');

var site = {
   prepareBucket: function (domain, success, error) {
    logger.info("Preparing bucket for " + domain);
    storage.hasWebsite(domain, function() {
      logger.ok("Website bucket ready");
      success();
    }, function(err) {
      storage.addWebsite(domain, function() {
        logger.ok("Website bucket ready");
        success();
      }, error);
    });
  },

  prepareDomain: function (domain, success, error) {
    logger.info("Preparing " + domain + " domain");
    dns.hasDomain(domain, function(zone) {
      logger.ok("Main domain " + domain + " ready");
      success(zone);
    }, function(err) {
       dns.addDomain(domain, function(zone) {
         logger.ok("Main domain " + domain + " ready");
         success(zone);
       }, error);
    });
  },

  prepareRecord: function (domain, zone, success, error) {
    logger.info("Preparing " + domain + " domain record");
    dns.records(zone, function(records) {
      if (dns.hasRecord(records, domain)) {
        logger.ok("Domain record " + domain + " ready");
        success(zone);
      } else {
        dns.addRecord(domain, zone, function() {
          logger.ok("Domain record " + domain + " ready");
          success(zone);
        }, error);
      }
    }, error);
  },

  coreDomain: function(domain) {
    var parts = domain.split('.');
    var total = parts.length - 2;
    for (var i = 0; i < total; i++) { parts.shift(); }
    return parts.join('.');
  },

  deploy: function (dir, domain, success, error) {
    // Make sure we're ready
    config.ensureInit();

    var coreDomain = site.coreDomain(domain);
    var needRedirect = false;
    var mainDomain = domain;
    if (domain === coreDomain) {
      mainDomain = 'www.' + domain;
      needRedirect = true;
    }

    logger.header("Start deploying");
    try {
      site.prepareBucket(mainDomain, function() {
        site.prepareDomain(coreDomain, function(zone) {
          site.prepareRecord(mainDomain, zone, function(zone) {
            if (needRedirect) {
              site.prepareBucket(domain, function() {
                storage.upload(mainDomain, dir, function() {
                  logger.footer("Done deploying");
                }, error);
              }, error);
            } else {
               storage.upload(mainDomain, dir, function() {
                 logger.footer("Done deploying");
               }, error);
            }
          }, error);
        }, error);
      }, error);
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports = site;
