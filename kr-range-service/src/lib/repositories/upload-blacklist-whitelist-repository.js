const models = require('../models')
const { Op } = require('sequelize')
exports.bulkInsertBlacklistWhitelist = async (data, transactionId) => {
  const { upload_blacklist_whitelist } = models()
  return upload_blacklist_whitelist.bulkCreate(data, { transaction: transactionId })
}

exports.findBlacklistWhitelistKeys = () => {
  const { upload_blacklist_whitelist } = models()
  return upload_blacklist_whitelist.rawAttributes.basedOn.values
}

exports.findBlacklistWhitelistByChannels = async (storeChannels) => {
  const { upload_blacklist_whitelist } = models()
  return upload_blacklist_whitelist.findAll({
    where: {
      channel: {
        [Op.in]: storeChannels
      }
    },
    raw: true
  })
}

exports.truncateTable = async () => {
  const { upload_blacklist_whitelist } = models()
  return upload_blacklist_whitelist.destroy({ truncate: true, cascade: false })
}
