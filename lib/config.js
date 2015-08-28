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
