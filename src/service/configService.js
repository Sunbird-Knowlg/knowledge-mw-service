/**
 *  configService - provides service methods for configurations like channel filters
 *
 * author: Loganathan Shanmugam
 * email: loganathan.shanmugam@tarento.com
 */

function getAllowedChannels (req, callback) {
  var allowedChannels = process.env.sunbird_content_service_allowed_channels
    ? process.env.sunbird_content_service_allowed_channels.split(',') : []
  callback(null, allowedChannels)
}

module.exports.getAllowedChannels = getAllowedChannels
