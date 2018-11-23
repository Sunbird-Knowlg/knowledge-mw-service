module.exports.CONTENT = {

  CREATE: {
    name: 'required|string',
    mimeType: 'required|string',
    contentType: 'required|string',
    createdBy: 'required|string'
  },

  UPDATE: {
    versionKey: 'required|string'
  },

  COLLABORATORS: {
    collaborators: 'required|array'
  },

  CREATE_LOCK: {
    'resourceId': 'required|string',
    'resourceType': 'required|string',
    'resourceInfo': 'required|string',
    'createdBy': 'required|string',
    'creatorInfo': 'required|string',
    'deviceId': 'required|string'
  }

}
