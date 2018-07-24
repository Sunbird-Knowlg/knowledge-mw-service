const whiteListedChannelList = process.env.sunbird_content_service_whitelisted_channels
const blackListedChannelList = process.env.sunbird_content_service_blacklisted_channels
const whitelistedFrameworkList = process.env.sunbird_content_service_whitelisted_framework
const blacklistedFrameworkList = process.env.sunbird_content_service_blacklisted_framework
const whitelistedMimeTypeList = process.env.sunbird_content_service_whitelisted_mimetype
const blacklistedMimeTypeList = process.env.sunbird_content_service_blacklisted_mimetype
const whitelistedContentTypeList = process.env.sunbird_content_service_whitelisted_contenttype
const blacklistedContentTypeList = process.env.sunbird_content_service_blacklisted_contenttype
const whitelistedResourceTypeList = process.env.sunbird_content_service_whitelisted_resourcetype
const blacklistedResourceTypeList = process.env.sunbird_content_service_blacklisted_resourcetype

module.exports = Object.freeze({
  allowedChannels: whiteListedChannelList ? whiteListedChannelList.split(',') : [],
  blackListedChannels: blackListedChannelList ? blackListedChannelList.split(',') : [],

  allowedFramework: whitelistedFrameworkList ? whitelistedFrameworkList.split(',') : [],
  blackListedFramework: blacklistedFrameworkList ? blacklistedFrameworkList.split(',') : [],

  allowedMimetype: whitelistedMimeTypeList ? whitelistedMimeTypeList.split(',') : [],
  blackListedMimetype: blacklistedMimeTypeList ? blacklistedMimeTypeList.split(',') : [],

  allowedContenttype: whitelistedContentTypeList ? whitelistedContentTypeList.split(',') : [],
  blackListedContenttype: blacklistedContentTypeList ? blacklistedContentTypeList.split(',') : [],

  allowedResourcetype: whitelistedResourceTypeList ? whitelistedResourceTypeList.split(',') : [],
  blackListedResourcetype: blacklistedResourceTypeList ? blacklistedResourceTypeList.split(',') : []
})
