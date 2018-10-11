var models = require('express-cassandra')
var LOG = require('sb_logger_util')
var path = require('path')
var filename = path.basename(__filename)
var contactPoints = process.env.sunbird_cassandra_ips.split(',')
var cassandra = require('cassandra-driver')
var consistency = getConsistencyLevel(process.env.sunbird_cassandra_consistency_level)
var replicationStrategy = getReplicationStrategy(process.env.sunbird_cassandra_replication_strategy)

models.setDirectory(path.join(__dirname, '.', '..', 'models', 'cassandra')).bind(
  {
    clientOptions: {
      contactPoints: contactPoints,
      protocolOptions: { port: process.env.sunbird_cassandra_port },
      keyspace: 'dialcodes',
      queryOptions: { consistency: consistency }
    },
    ormOptions: {
      defaultReplicationStrategy: replicationStrategy,
      migration: 'safe'
    }
  },
  function (err) {
    if (err) {
      LOG.error({ filename, 'Error connecting to the database: ': err })
      throw err
    } else {
      LOG.info({ filename, 'connecting to database': 'success' })
    }
  }
)

function checkCassandraDBHealth (callback) {
  const client = new cassandra.Client({ contactPoints: contactPoints })
  client.connect()
    .then(function () {
      client.shutdown()
      callback(null, true)
    })
    .catch(function (err) {
      console.log('cassandra err:', err)
      client.shutdown()
      callback(err, false)
    })
}

function getConsistencyLevel (consistency) {
  let consistencyValue = models.consistencies.one
  if (consistency) {
    if (models.consistencies[consistency]) {
      consistencyValue = models.consistencies[consistency]
    }
  }
  return consistencyValue
}

function getReplicationStrategy (replicationStrategy) {
  try {
    return JSON.parse(replicationStrategy)
  } catch (e) {
    return {'class': 'SimpleStrategy', 'replication_factor': '1'}
  }
}

module.exports = models
module.exports.checkCassandraDBHealth = checkCassandraDBHealth
