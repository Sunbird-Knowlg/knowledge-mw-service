const kafka = require('kafka-node')
const fs = require('fs')
const _ = require('lodash')
var LOG = require('sb_logger_util')

const client = new kafka.KafkaClient({
  kafkaHost: process.env.sunbird_kafkaHost || 'localhost:9092',
  maxAsyncRequests: 100
})

const producer = new kafka.HighLevelProducer(client)
producer.on('ready', function () {
  console.log('Kafka Producer is connected and ready.')
})

// For this demo we just log producer errors to the console.
producer.on('error', function (error) {
  console.error(error)
})

const KafkaService = {
  sendRecord: (data, callback = () => { }) => { // dialcodes, config, processId, objectId, path
    if (_.isEmpty(data)) {
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
        messages: event,
        key: data.objectId

      }
    ]

    LOG.info({'kafkaRecord': record})
    // Send record to Kafka and log result/error
    producer.send(record, callback)
  }
}

module.exports = KafkaService
