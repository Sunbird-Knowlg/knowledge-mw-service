var expect = require('chai').expect
var path = require('path')
var cassandraDriver = require('cassandra-driver')
var cassandraSecurity = require('../../utils/cassandraSecurity')

var fixture = function (name) { return path.join(__dirname, '..', 'fixtures', name) }
var options = function (env) { return cassandraSecurity.getSecurityOptions(cassandraDriver, env) }
var tls = function (rootCert) {
  return { sunbird_cassandra_ssl_enabled: 'true', sunbird_cassandra_sslrootcert: rootCert }
}

describe('cassandraSecurity.getSecurityOptions', function () {
  it('leaves the options empty by default', function () {
    expect(options({})).to.deep.equal({})
  })

  it('skips credentials when the password is missing', function () {
    expect(options({ sunbird_cassandra_username: 'admin' })).to.not.have.property('authProvider')
  })

  it('sets a plain text auth provider when username and password are set', function () {
    var result = options({ sunbird_cassandra_username: 'admin', sunbird_cassandra_password: 'secret' })
    expect(result.authProvider).to.be.instanceOf(cassandraDriver.auth.PlainTextAuthProvider)
  })

  it('does not enable TLS unless sunbird_cassandra_ssl_enabled is true', function () {
    var env = tls(fixture('test-root.crt'))
    env.sunbird_cassandra_ssl_enabled = 'false'
    expect(options(env)).to.not.have.property('sslOptions')
  })

  it('trusts only the given CA when TLS is enabled', function () {
    var ssl = options(tls(fixture('test-root.crt'))).sslOptions
    expect(ssl.ca.toString()).to.contain('BEGIN CERTIFICATE')
    expect(ssl.checkServerIdentity()).to.equal(undefined)
  })

  it('verifies the certificate chain', function () {
    // the driver defaults this to false when sslOptions is set, which would trust any certificate
    expect(options(tls(fixture('test-root.crt'))).sslOptions.rejectUnauthorized).to.equal(true)
  })

  it('accepts a bundle of several certificates', function () {
    var ssl = options(tls(fixture('test-bundle.crt'))).sslOptions
    expect(ssl.ca.toString().match(/BEGIN CERTIFICATE/g)).to.have.length(2)
  })

  it('throws when TLS is enabled without a certificate path', function () {
    expect(function () { options({ sunbird_cassandra_ssl_enabled: 'true' }) })
      .to.throw('sunbird_cassandra_sslrootcert must be set')
  })

  it('throws when the certificate file is missing', function () {
    expect(function () { options(tls('/does/not/exist.crt')) })
      .to.throw('Failed to read Cassandra root certificate')
  })

  it('throws when the file holds no certificate', function () {
    var notACert = path.join(__dirname, '..', '..', 'package.json')
    expect(function () { options(tls(notACert)) }).to.throw('No certificate found')
  })
})
