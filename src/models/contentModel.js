module.exports.CONTENT = {

  CREATE: {
    name: 'required|string',
    mimeType: 'required|string',
    contentType: 'required|string',
    createdBy: 'required|string'
  },

  UPDATE: {
    versionKey: 'required|string'
  }

}
