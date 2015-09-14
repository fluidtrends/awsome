var AWS      = require('aws-sdk');
var prompt   = require('readline-sync');
var path     = require('path');
var fs       = require('fs-extra');
var inquirer = require('inquirer');
var readline = require('readline-sync');

var config = {

  homeDir: function () {
    return path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], '.awsome/');
  },

  newKey: function(name, content) {
    var dir = config.keystoreDir();
    if (!fs.existsSync(dir)) {
      fs.mkdirsSync(config.keystoreDir());
    }
    dir = path.join(dir, name);
    fs.mkdirs(dir);

    fs.writeFileSync(path.join(dir, "key.pem"), content.KeyMaterial);
    fs.writeFileSync(path.join(dir, "key.fingerprint"), content.KeyFingerprint);
  },

  keyExists: function(name) {
    return fs.existsSync(path.join(config.keystoreDir(), name));
  },

  key: function(name) {

    if (!config.keystoreDir()) {
      return;
    }

    if (!name) {
      name = config.defaultKeyName();
    }

    var file = path.join(config.keystoreDir(), name + "/key.pem");
    if (!fs.existsSync(file)) {
      return;
    }

    var content = fs.readFileSync(file);
    if (!content) {
      return;
    }

    return content;
  },

  keystoreDir: function () {
    return path.join(config.homeDir(), 'keystore');
  },

  cloudstoreDir: function () {
    return path.join(config.homeDir(), 'cloudstore');
  },

  cleanCloudstore: function (machineNames) {
    var dir = config.cloudstoreDir();
    if (!fs.existsSync(dir)){
      return;
    }

    if (!machineNames || machineNames.length == 0) {
      fs.removeSync(dir);
      return;
    }

    machineNames.forEach(function(m) {
      fs.removeSync(path.join(dir, m));
    });
  },

  machine: function(name) {
    if (!name) {
      return;
    }

    var dir = config.cloudstoreDir();
    if (!fs.existsSync(dir)){
      return;
    }

    dir = path.join(dir, name);
    if (!fs.existsSync(dir)){
      return;
    }

    var machine = path.join(dir, 'config.json');
    if (!fs.existsSync(machine)){
      return;
    }

    machine = fs.readFileSync(machine);
    if (!machine) {
      return;
    }

    return JSON.parse(machine);
  },

  newMachine: function(machine) {
    var dir = config.cloudstoreDir();
    if (!fs.existsSync(dir)){
      fs.mkdirsSync(dir)
    }
    dir = path.join(dir, machine.InstanceId);
    if (fs.existsSync(dir)){
      return;
    }

    fs.mkdirsSync(dir);
    fs.outputJsonSync(path.join(dir, 'config.json'), machine);
  },

  credentialsFile: function () {
    return path.join(config.homeDir(), 'credentials.json');
  },

  exists:  function () {
    return fs.existsSync(config.homeDir());
  },

  init: function (key, secret, region) {
    if (config.exists()) {
      return false;
    }

    fs.mkdirsSync(config.homeDir());

    if (!config.exists()) {
      return false;
    }

    fs.mkdirsSync(config.keystoreDir());

    fs.outputJsonSync(config.credentialsFile(), {accessKeyId: key, secretAccessKey: secret, region: region});
    if (!fs.existsSync(config.credentialsFile())) {
      return false;
    }

    AWS.config.loadFromPath(config.credentialsFile());

    return true;
  },

  initInteractive: function () {
    var key    = readline.question('Enter your AWS key:');
    var secret = readline.question('Enter your AWS secret:');
    var region = readline.question('Enter your AWS region:');

    return config.init(key, secret, region);
  },

  ensureInit: function () {
    if (config.exists()) {
      AWS.config.loadFromPath(config.credentialsFile());
      return;
    }
    config.initInteractive();
  }
};

module.exports = config;
