module.exports = {
  table_name: 'lock',
  fields: {
    lockId: 'uuid',
    resourceId: 'text',
    resourceType: 'text',
    resourceInfo: 'text',
    createdBy: 'text',
    creatorInfo: 'text',
    createdOn: 'timestamp',
    deviceId: 'text',
    expiresAt: 'timestamp'
  },
  key: ['resourceId', 'resourceType'],
  indexes: ['lockId']
}
