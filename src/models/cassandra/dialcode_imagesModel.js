module.exports = {
  fields: {
    filename: 'text',
    created_on: {
      type: 'timestamp',
      default: {'$db_function': 'toTimestamp(now())'}
    },
    dialcode: 'text',
    channel: 'text',
    publisher: 'text',
    config: {
      type: 'map',
      typeDef: '<text, text>'
    },
    status: 'int', // 0 - not available , 1 - in process , 2 - available
    url: 'text'

  },
  key: ['filename']
}
