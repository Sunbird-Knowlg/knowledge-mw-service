module.exports = {
  table_name: 'create_lock',
  fields: {
    resourceId: 'text',
    resourceType: 'text',
    resourceInfo: 'text',
    createdBy: 'text',
    creatorInfo: 'text',
    createdOn: 'timestamp',
    deviceId: 'text',
    expiresAt: 'timestamp'
  },
  key: ['resourceId']
}
