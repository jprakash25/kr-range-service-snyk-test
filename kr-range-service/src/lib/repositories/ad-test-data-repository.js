const models = require('./../models')
const { logger } = require('../../service/logger.service')

exports.getByUsername = async (username) => {
  try {
    const { ad_test_data } = models()
    const params = {
      where: {
        username
      },
      raw: true
    }
    return ad_test_data.findOne(params)
  } catch (error) {
    logger.error({ error }, 'Error while creating user profile')
    throw new Error(error)
  }
}
