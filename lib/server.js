var coreutils  = require('coreutils');
var logger     = coreutils.logger;
var config     = require('./config');
var path       = require('path');
var AWS        = require('aws-sdk');
var fs         = require('fs-extra');
var ssh        = require('ssh2');

var server = {

  images: {ubuntu64: 'ami-d85e75b0'},
  sizes: {t1: {micro: 't1.micro'}},

  putDir: function(dir, serverName, callback) {

    // Make sure we're ready
    config.ensureInit();

    server.find(serverName, function(err, machine) {
      if (err) {
        callback(err);
        return;
      }

      if (!machine) {
        callback(new Error("Server " + serverName + " does not exist"));
        return;
      }

      if (!machine.State || !machine.State.Name || machine.State.Name != 'running') {
        callback(new Error('Machine not running'));
        return;
      }

      if (!machine.KeyName) {
        callback(new Error('Invalid machine key'));
        return;
      }

      var key = config.key(machine.KeyName);

      if (!key) {
        callback(new Error('Invalid machine key'));
        return;
      }

      if (!machine.PublicIpAddress) {
        callback(new Error('Invalid machine public ip address'));
        return;
      }

      server.ftp.open(machine, 'awsome', function(err, sftp, conn) {
        if (err) {
          callback(err);
          return;
        }

        server.ftp.cpDir(dir, sftp, conn, function(err) {
          if (err) {
            callback(err);
            return;
          }
          conn.end();
          callback();
        });

      });
    });
  },

  ssh: function(machine, username, callback) {
    if (!machine.State || !machine.State.Name || machine.State.Name != 'running') {
      callback(new Error('Machine not running'));
      return;
    }

    if (!machine.KeyName) {
      callback(new Error('Invalid machine key'));
      return;
    }

    var key = config.key(machine.KeyName);

    if (!key) {
      callback(new Error('Invalid machine key'));
      return;
    }

    if (!machine.PublicIpAddress) {
      callback(new Error('Invalid machine public ip address'));
      return;
    }

    var Client = ssh.Client;
    var conn = new Client();
    conn.on('ready', function() {
      callback(null, conn);
    }).connect({
      host: machine.PublicIpAddress,
      port: 22,
      username: username,
      privateKey: key
    });
  },

  ftp: {
    open: function (machine, username, callback) {
      server.ssh(machine, username, function(err, conn){
          if (err) {
            callback(err);
            return;
          }

          conn.sftp(function(err, sftp) {
            if (err) {
              conn.end();
              callback(err);
              return;
            }
            callback(null, sftp, conn);
          });
      });
    },

    cpDir: function(dir, sftp, conn, callback) {

      var dirname = path.basename(dir);
      var files = fs.readdirSync(dir);
      files.forEach(function(file){
        console.log(file);
      });

      // sftp.fastPut(dir, function(err, list) {
      //   if (err) {
      //     conn.end();
      //     callback(err);
      //     return;
      //   }
      //   callback();
      // });
    },

    mkDir: function(dir, sftp, conn, callback) {
      sftp.mkdir(dir, function(err, list) {
        if (err) {
          conn.end();
          callback(err);
          return;
        }
        callback();
      });
    },

    hasDir: function(dir, sftp, conn, callback) {
      sftp.readdir(dir, function(err, list) {
        if (err) {
          if (err.code != 2) {
            conn.end();
            callback(err);
            return;
          }
          callback(null, false);
          return;
        }
        callback(null, true);
      });
    },

    readDir: function(dir, sftp, conn, callback) {
      sftp.readdir(dir, function(err, list) {
        if (err) {
          conn.end();
          callback(err);
          return;
        }
        callback(null, list);
      });
    }
  },

  exec: function(script, machine, username, callback) {
    if (!script || !fs.existsSync('./ops/' + script + ".sh")) {
      callback(new Error('Invalid script'));
      return;
    }

    script = fs.readFileSync('./ops/' + script + ".sh");

    server.ssh(machine, username, function(err, conn){
        if (err) {
          callback(err);
          return;
        }
        conn.exec(script, function(err, stream) {
          if (err) {
            callback(err);
            return;
          }
          stream.on('close', function(code, signal) {
            conn.end();
            if (code != 0) {
              callback(new Error('Error code ' + code));
              return;
            }
            callback();
          }).on('data', function(data) {
            console.log('**** [awsome] **** ' + data);
          });
        });
    });
  },

  createKeyPair: function (name, callback) {

    // Make sure we're ready
    config.ensureInit();

    if (config.keyExists(name)) {
      callback(new Error('Key already exists'));
      return;
    }

    var ec2 = new AWS.EC2();

    var params = {
      KeyName: name,
      DryRun: false
    };

    ec2.createKeyPair(params, function(err, data) {
      if (err) {
        callback(err);
        return;
      }

      config.newKey(name, data);
      callback(null, name);
    });
  },

  sync: function(callback, names) {

    // Make sure we're ready
    config.ensureInit();

    var ec2 = new AWS.EC2();

    var params = {
      DryRun: false,
    };

    if (names) {
      params.InstanceIds = names;
    } else {
      params.MaxResults = 1000;
    }

    ec2.describeInstances(params, function(err, data) {
      if (err) {
        callback(err);
        return;
      }

      if (!data) {
        callback(new Error('No data'));
        return;
      }

      var machines = [];
      config.cleanCloudstore(names);

      data.Reservations.forEach(function(server) {
        if (server.Instances) {
          server.Instances.forEach(function(machine) {
            config.newMachine(machine);
            machines.push(machine);
          });
        }
      });

      callback(null, machines);
    });

  },

  provision: function (name, callback) {

    // Make sure we're ready
    config.ensureInit();

    server.find(name, function(err, machine) {
      if (err) {
        callback(err);
        return;
      }

      if (!machine) {
        callback(new Error("Server does not exist"));
        return;
      }

      if (machine.State.Name != 'running') {
        callback(new Error("Server is not running"));
        return;
      }

      server.exec('setup', machine, 'ubuntu', function(err){
          if (err) {
            callback(err);
            return;
          }

          server.exec('nginx', machine, 'awsome', function(err){
            if (err) {
              callback(err);
              return;
            }

            server.exec('node', machine, 'awsome', callback);
          });
      });
    });
  },

  find: function(name, callback) {
    // Make sure we're ready
    config.ensureInit();

    server.sync(function(err, servers) {
      if (err) {
        callback(err);
        return;
      }

      var found;
      servers.forEach(function(machine) {
        machine.Tags.forEach(function(tag){
          if (tag.Key === 'Name' && tag.Value === name) {
            found = machine;
          }
        })
      });
      callback(null, found);
    });
  },

  create: function (name, callback) {

    // Make sure we're ready
    config.ensureInit();

    server.find(name, function(err, machine) {
      if (err) {
        callback(err);
        return;
      }

      if (machine) {
        callback(new Error("Server already exists"));
        return;
      }

      var key = config.key('admin');
      if (!key) {
        callback(new Error('No admin key found'));
        return;
      }

      var ec2 = new AWS.EC2();

      var params = {
        ImageId: server.images.ubuntu64,
        InstanceType: server.sizes.t1.micro,
        MinCount: 1,
        MaxCount: 1,
        KeyName: 'admin'
      };

      ec2.runInstances(params, function(err, data) {
        if (err) {
          callback(err);
          return;
        }

        if (!data || !data.Instances || data.Instances.length == 0) {
          callback(new Error('No instances'));
          return;
        }

        var newMachine = data.Instances[0];

        // Add tags to the instance
        params = {Resources: [newMachine.InstanceId], Tags: [
          {Key: 'Name', Value: name}
        ]};

        ec2.createTags(params, function(err) {
          if (err) {
            callback(err);
            return;
          }
          config.newMachine(newMachine);
          callback(null, newMachine);
        });
      });

    });
  }

};

module.exports = server;
