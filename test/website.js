var sinon   = require('sinon');
var path    = require('path');
var fs      = require('fs-extra');
var expect  = require('chai/chai').expect;
var awsome  = require('..');

describe('Website', function () {
  var config      = awsome.config;

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

  it('can deploy a website', function () {
    if (!config.exists()) {
      return;
    }
  });

});
