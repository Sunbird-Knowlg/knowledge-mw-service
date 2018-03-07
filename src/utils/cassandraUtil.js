var models = require('express-cassandra')
var LOG = require('sb_logger_util')
var path = require('path')
var filename = path.basename(__filename)
var contactPoints = process.env.sunbird_cassandra_ips.split(',')
var isCassandraConnected = false

models.setDirectory(path.join(__dirname, '.', '..', 'models', 'cassandra')).bind(
  {
    clientOptions: {
      contactPoints: contactPoints,
      protocolOptions: { port: process.env.sunbird_cassandra_port },
      keyspace: 'dialcodes',
      queryOptions: {consistency: models.consistencies.one}
    },
    ormOptions: {
      defaultReplicationStrategy: {
        class: 'SimpleStrategy',
        replication_factor: 1
      },
      migration: 'safe'
    }
  },
  function (err) {
    if (err) {
      isCassandraConnected = false
      LOG.error({filename, 'Error connecting to the database: ': err})
      throw err
    } else {
      isCassandraConnected = true
      LOG.info({filename, 'connecting to database': 'success'})
    }
  }
)

function getCassandraStatus () {
  return isCassandraConnected
}

module.exports = models
module.exports.getCassandraStatus = getCassandraStatus
