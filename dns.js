var path       = require('path');
var AWS        = require('aws-sdk');
var coreutils  = require('coreutils');

var dns = {

  defaultRegion: 'us-east-1',

  hasDomain: function (domain, success, error) {
    dns.zones(function(zones) {
      var foundZone;
      zones.forEach(function(zone) {
        if (zone.Name === domain + ".") {
          foundZone = zone;
          return;
        }
      });
      if (foundZone) {
        success(foundZone);
      } else {
        error("Zone not found");
      }
    }, error);
  },

  zones: function (success, error) {
    var route53 = new AWS.Route53();
    route53.listHostedZones({}, function(err, data) {
      if (err) {
        error(err);
        return;
      }

      if (!data || !data.HostedZones || data.HostedZones.length <= 0) {
        error("No zones found.");
        return;
      }
      success(data.HostedZones);
    });
  },

  records: function (zone, success, error) {
    var route53 = new AWS.Route53();
    var params = {
      HostedZoneId: path.basename(zone.Id)
    };

    route53.listResourceRecordSets(params, function(err, data) {
      if (err){
        error(err);
        return;
      }

      if (!data || !data.ResourceRecordSets) {
        error("Invalid change zone request");
        return;
      }

      success(data.ResourceRecordSets);
    });
  },

  addRecord: function (domain, zone, success, error) {
    var route53 = new AWS.Route53();
    var params = {
    ChangeBatch: {
      Changes: [
          {
            Action: 'CREATE',
            ResourceRecordSet: {
              Name: domain,
              Type: 'CNAME',
              ResourceRecords: [
                {
                  Value: "s3-website-" + dns.defaultRegion + ".amazonaws.com"
                }
              ],
              TTL: 60
            }
          }
        ],
        Comment: 'Created via carmel'
      },
      HostedZoneId: path.basename(zone.Id)
    };

    coreutils.logger.info("Adding domain record for " + domain);
    route53.changeResourceRecordSets(params, function(err, data) {
      if (err) {
          error(err);
          return;
      }

      if (!data || !data.ChangeInfo) {
        error("Invalid change zone request");
        return;
      }

      success(data.ChangeInfo);
    });
  },

  addDomain: function (domain, success, error) {
    coreutils.logger.info("Adding domain " + domain);
    var uuid = utils.uuid();

    var params = {
      CallerReference: 'carmel-' + uuid,
      Name: domain,
      HostedZoneConfig: {
        Comment: 'Hosted via carmel'
      }
    };
    var route53 = new AWS.Route53();

    route53.createHostedZone(params, function(err, data) {
      if (err) {
        error(err);
        return;
      }

      if (!data || !data.HostedZone) {
        error("Invalid hosted zone");
        return;
      }

      success(data.HostedZone);
    });
  },

  hasRecord: function (resources, domain) {
    if (!resources || resources.length <= 0) {
      return false;
    }

    var mapped = false;
    resources.forEach(function(resource) {
      if (resource.Type === 'CNAME' && resource.Name === domain + ".") {
        mapped = true;
      }
    });

    return mapped;
  }
}

module.exports = dns;
