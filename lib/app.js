var coreutils  = require('coreutils');
var logger     = coreutils.logger;
var config     = require('./config');
var AWS        = require('aws-sdk');
var fs         = require('fs-extra');
var ssh        = require('ssh2');
var server     = require('./server');

var app = {
  deploy: function (dir, serverName, domain, callback) {
    server.putDir(dir, serverName, callback);
  }
};

module.exports = app;
