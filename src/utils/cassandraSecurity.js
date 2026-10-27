'use strict'

var fs = require('fs')

/**
 * Credentials and TLS for Cassandra clients. Both are off by default, so existing
 * deployments are unaffected.
 *
 * Env: sunbird_cassandra_username, sunbird_cassandra_password,
 * sunbird_cassandra_ssl_enabled, sunbird_cassandra_sslrootcert.
 *
 * `driver` is the cassandra-driver module the client will use, so the auth provider
 * matches that client's driver version.
 */
function getSecurityOptions (driver, env) {
  env = env || process.env
  var options = {}
  if (env.sunbird_cassandra_username && env.sunbird_cassandra_password) {
    options.authProvider = new driver.auth.PlainTextAuthProvider(
      env.sunbird_cassandra_username, env.sunbird_cassandra_password)
  }
  if (String(env.sunbird_cassandra_ssl_enabled).toLowerCase() === 'true') {
    options.sslOptions = buildSslOptions(env.sunbird_cassandra_sslrootcert)
  }
  return options
}

// Trusts only the CA(s) in the PEM file (it may hold several certificates).
// ponytail: chain and dates are verified, hostname is not, because nodes are reached by IP.
// Drop checkServerIdentity if the cluster certificate covers the addresses clients use.
function buildSslOptions (rootCertPath) {
  if (!rootCertPath) {
    throw new Error('sunbird_cassandra_sslrootcert must be set when sunbird_cassandra_ssl_enabled is true')
  }
  var ca
  try {
    ca = fs.readFileSync(rootCertPath)
  } catch (e) {
    throw new Error('Failed to read Cassandra root certificate ' + rootCertPath + ': ' + e.message)
  }
  if (ca.toString().indexOf('BEGIN CERTIFICATE') === -1) {
    throw new Error('No certificate found in ' + rootCertPath)
  }
  // rejectUnauthorized must be explicit: the driver defaults it to false when sslOptions is set.
  return { ca: ca, rejectUnauthorized: true, checkServerIdentity: function () { return undefined } }
}

module.exports = { getSecurityOptions: getSecurityOptions }
