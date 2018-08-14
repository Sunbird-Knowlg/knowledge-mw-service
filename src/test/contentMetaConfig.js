module.exports = Object.freeze({
  allowedChannels: process.env.sunbird_content_service_whitelisted_channels
    ? process.env.sunbird_content_service_whitelisted_channels.split(',') : [],
  blackListedChannels: process.env.sunbird_content_service_blacklisted_channels
    ? process.env.sunbird_content_service_blacklisted_channels.split(',') : [],

  allowedFramework: process.env.sunbird_content_service_whitelisted_framework
    ? process.env.sunbird_content_service_whitelisted_framework.split(',') : [],
  blackListedFramework: process.env.sunbird_content_service_blacklisted_framework
    ? process.env.sunbird_content_service_blacklisted_framework.split(',') : [],

  allowedMimetype: process.env.sunbird_content_service_whitelisted_mimetype
    ? process.env.sunbird_content_service_whitelisted_mimetype.split(',') : [],
  blackListedMimetype: process.env.sunbird_content_service_blacklisted_mimetype
    ? process.env.sunbird_content_service_blacklisted_mimetype.split(',') : [],

  allowedContenttype: process.env.sunbird_content_service_whitelisted_contenttype
    ? process.env.sunbird_content_service_whitelisted_contenttype.split(',') : [],
  blackListedContenttype: process.env.sunbird_content_service_blacklisted_contenttype
    ? process.env.sunbird_content_service_blacklisted_contenttype.split(',') : [],

  allowedResourcetype: process.env.sunbird_content_service_whitelisted_resourcetype
    ? process.env.sunbird_content_service_whitelisted_resourcetype.split(',') : [],
  blackListedResourcetype: process.env.sunbird_content_service_blacklisted_resourcetype
    ? process.env.sunbird_content_service_blacklisted_resourcetype.split(',') : []
})
