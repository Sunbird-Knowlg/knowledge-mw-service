module.exports = {
  table_name: 'create_lock',
  fields: {
    resourceId: 'text',
    resourceType: 'text',
    resourceInfo: 'text',
    createdBy: 'text',
    creatorInfo: 'text',
    created_on: 'timestamp',
    deviceId: 'text',
    expiresAt: 'timestamp'
  },
  key: ['resourceId']
}
