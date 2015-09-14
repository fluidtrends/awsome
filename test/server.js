var sinon     = require('sinon');
var path      = require('path');
var fs        = require('fs-extra');
var coreutils = require('coreutils');
var expect    = require('chai/chai').expect;
var awsome    = require('..');

describe('Server', function () {
  var config = awsome.config;
  var server = awsome.server;
  this.timeout(1200000);

  beforeEach(function(done) {
    if (fs.existsSync('./tmp')) {
      // Start off clean
      fs.removeSync('./tmp');
    }
    done();
  });

  afterEach(function(done) {
    if (fs.existsSync('./tmp')) {
      // Clean up
      fs.removeSync('./tmp');
    }
    done();
  });

  it('can create a key pair', function (done) {
    if (!config.exists()) {
      return;
    }

    server.createKeyPair('admin', function(err, keyName) {
    expect(err).to.not.exist;
      done();
    });
  });

  it('can sync servers', function (done) {
    if (!config.exists()) {
      return;
    }

    server.sync(function(err, servers) {
    expect(err).to.not.exist;
      done();
    });
  });

  it('can create a new server', function (done) {
    if (!config.exists()) {
      return;
    }

    server.create('appserver', function(err, instance) {
      expect(err).to.not.exist;
      done();
    });
  });

  it('can provision a new server', function (done) {
    if (!config.exists()) {
      return;
    }

    server.provision('appserver', function(err) {
      expect(err).to.not.exist;
      done();
    });
  });

});
