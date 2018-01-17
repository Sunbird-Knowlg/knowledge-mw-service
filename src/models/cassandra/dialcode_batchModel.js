module.exports = {
  fields: {
    processid: {
      type: 'uuid',
      default: {'$db_function': 'uuid()'}
    },
    channel: 'text',
    publisher: 'text',
    created_on: {
      type: 'timestamp',
      default: {'$db_function': 'toTimestamp(now())'}
    },
    dialcodes: {
      type: 'list',
      typeDef: '<text>'
    },
    config: {
      type: 'map',
      typeDef: '<text, text>'
    },
    status: 'int',
    url: 'text'
  },
  key: ['processid']
}
