var sinon     = require('sinon');
var path      = require('path');
var fs        = require('fs-extra');
var coreutils = require('coreutils');
var expect    = require('chai/chai').expect;
var awsome    = require('..');

describe('App', function () {
  var config = awsome.config;
  var app = awsome.app;
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

  it('can deploy an app', function (done) {
    if (!config.exists()) {
      return;
    }

    app.deploy('./tmp/app', 'appserver', 'domain', function(err) {
      expect(err).to.not.exist;
      done();
    });
  });

});
