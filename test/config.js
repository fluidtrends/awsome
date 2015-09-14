var sinon   = require('sinon');
var path    = require('path');
var fs      = require('fs-extra');
var expect  = require('chai/chai').expect;
var awsome  = require('..');

describe('Configuration', function () {
  var config      = awsome.config;
  var stdin       = require('mock-stdin').stdin();
  var stub;

  beforeEach(function(done) {
    stub = sinon.stub(config, "homeDir").returns('./tmp/homedir/');
    if (fs.existsSync('./tmp')) {
      // Start off clean
      fs.removeSync('./tmp');
    }
    done();
  });

  afterEach(function(done) {
    stub.restore();
    if (fs.existsSync('./tmp')) {
      // Clean up
      fs.removeSync('./tmp');
    }
    done();
  });

  it('is aware if home dir is missing', function () {
    expect(config.exists()).to.be.notOk;
  });

  it('can create a new configuration', function () {
    expect(config.init('_key', '_secret', '_secret')).to.be.true;
    var credentials = fs.readFileSync(config.credentialsFile());
    expect(credentials).to.be.ok;
    credentials = JSON.parse(credentials);
    expect(credentials).to.be.ok;
    expect(credentials.accessKeyId).to.equal('_key');
    expect(credentials.secretAccessKey).to.equal('_secret');
    expect(credentials.region).to.equal('_secret');
  });
});
