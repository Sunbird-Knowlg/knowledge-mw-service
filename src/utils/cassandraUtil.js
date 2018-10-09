var models = require('express-cassandra')
var LOG = require('sb_logger_util')
var path = require('path')
var filename = path.basename(__filename)
var contactPoints = process.env.sunbird_cassandra_ips.split(',')
var cassandra = require('cassandra-driver')
var consistency = getConsistencyLevel(process.env.sunbird_cassandra_consistency_level)
var replicationStrategy = getReplicationStrategy(process.env.sunbird_cassandra_replication_strategy)

console.log('consistency', consistency)
console.log('replicationStrategy', replicationStrategy)

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
  if (consistency && contactPoints && contactPoints.length > 1) {
    if (models.consistencies[consistency]) {
      consistencyValue = models.consistencies[consistency]
    }
  }
  return consistencyValue
}

function getReplicationStrategy (replicationStrategy) {
  let replicationStrategyValue = {}
  if (replicationStrategy && contactPoints && contactPoints.length > 1) {
    replicationStrategyValue = JSON.parse(replicationStrategy)
    if (!Object.keys(replicationStrategyValue).length) {
      replicationStrategyValue = {}
    }
  }
  return replicationStrategyValue
}

module.exports = models
module.exports.checkCassandraDBHealth = checkCassandraDBHealth
