var path       = require('path');
var AWS        = require('aws-sdk');
var coreutils  = require('coreutils');

var dns = {
  defaultRegionIds: {
    'us-east-1': 'Z3AQBSTGFYJSTF',
    'us-west-2': 'Z3BJ6K6RIION7M',
    'us-west-1': 'Z2F56UZL2M1ACD',
    'eu-west-1': 'Z1BKCTXD74EZPE',
    'ap-southeast-1': 'Z3O0J2DXBE1FTB',
    'ap-southeast-2': 'Z1WCIGYICN2BYD',
    'ap-northeast-1': 'Z2M4EHUR26P7ZW',
    'sa-east-1': 'Z7KQH4QJS55SO',
    'us-gov-west-1': 'Z31GFT0UA1I2HV'
  },
  
  defaultRegion: 'us-east-1',
  defaultRegionId: 'Z3AQBSTGFYJSTF',

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
    var route53   = new AWS.Route53();
    var parts     = domain.split('.');
    var root      = (parts.length == 2);
    var dnsTarget = "s3-website-" + dns.defaultRegion + ".amazonaws.com.";

    var params = {
      ChangeBatch: {
        Changes: [
          {
            Action: 'CREATE',
            ResourceRecordSet: {
              Name: domain,
              Type: (root ? 'A' : 'CNAME')
            }
          }
        ],
        Comment: 'Created via carmel'
      },
      HostedZoneId: path.basename(zone.Id)
    };

    if (root) {
      params.ChangeBatch.Changes[0].ResourceRecordSet['AliasTarget'] = {
         DNSName: dnsTarget,
         HostedZoneId: dns.defaultRegionId,
         EvaluateTargetHealth: false
      };
    } else {
      params.ChangeBatch.Changes[0].ResourceRecordSet['ResourceRecords'] = [{ Value: dnsTarget }];
      params.ChangeBatch.Changes[0].ResourceRecordSet['TTL'] = 60;
    }

    route53.changeResourceRecordSets(params, function(err, data) {
      if (err) {
        console.log(err);
          error(err);
          coreutils.logger.fail("Could not add " + domain + " domain record");
          return;
      }

      if (!data || !data.ChangeInfo) {
        error("Invalid change zone request");
        coreutils.logger.fail("Could not add " + domain + " domain record");
        return;
      }
      coreutils.logger.ok("Added " + domain + " domain record");
      success(data.ChangeInfo);
    });
  },

  addDomain: function (domain, success, error) {
    var uuid = coreutils.uuid();

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
        coreutils.logger.fail("Could not add " + domain + " domain");
        return;
      }

      if (!data || !data.HostedZone) {
        error("Invalid hosted zone");
        coreutils.logger.fail("Could not add " + domain + " domain");
        return;
      }

      coreutils.logger.ok("Added " + domain + " domain");
      success(data.HostedZone);
    });
  },

  hasRecord: function (resources, domain) {
    if (!resources || resources.length <= 0) {
      return false;
    }

    var parts  = domain.split('.');
    var root   = (parts.length == 2);
    var mapped = false;
    resources.forEach(function(resource) {
      if (((!root && resource.Type === 'CNAME') || (root && resource.Type === 'A')) && resource.Name === domain + ".") {
        mapped = true;
        return;
      }
    });

    return mapped;
  }
}

module.exports = dns;
