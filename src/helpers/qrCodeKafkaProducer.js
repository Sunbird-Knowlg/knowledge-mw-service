const kafka = require('kafka-node')
const fs = require('fs')
const _ = require('lodash')
var logger = require('sb_logger_util_v2')

const client = new kafka.KafkaClient({
  kafkaHost: process.env.sunbird_kafka_host || 'localhost:9092',
  maxAsyncRequests: 100
})

const producer = new kafka.HighLevelProducer(client)
producer.on('ready', function () {
  console.log('Kafka Producer is connected and ready.')
  logger.info({msg: 'Kafka Producer is connected and ready.'})
})

// For this demo we just log producer errors to the console.
producer.on('error', function (error) {
  logger.error({msg: 'Error from Kafka producer', error})
  console.error(error)
})

const KafkaService = {
  sendRecord: (data, callback = () => { }) => { // dialcodes, config, processId, objectId, path
    if (_.isEmpty(data)) {
      logger.error({msg: 'Data must be provided to send Record', additionalInfo: {data}})
      return callback(new Error('Data must be provided.'))
    }

    const event = {
      'eid': 'BE_QR_IMAGE_GENERATOR',
      'processId': data.processId,
      'objectId': data.objectId, // "contentid/channel",
      'dialcodes': data.dialcodes,
      'storage': data.storage,
      'config': data.config
    }

    // Create a new payload
    const record = [
      {
        topic: process.env.sunbird_qrimage_topic, // "sunbirddev.qrimage.request",
        messages: JSON.stringify(event),
        key: data.objectId

      }
    ]
    logger.info({msg: 'Kafka record', additionalInfo: {record}})
    // Send record to Kafka and log result/error
    producer.send(record, callback)
  }
}

module.exports = KafkaService
