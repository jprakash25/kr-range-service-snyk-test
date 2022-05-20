const models = require('../models')
const { logger } = require('../../service/logger.service')

exports.bulkCreateUserProfile = (model) => {
  try {
    const { user_profile } = models()
    const options = {
      fields: ['username', 'displayName', 'storeType', 'hasLock', 'hasAllDeptAccess', 'departmentAccess', 'createdAt', 'updatedAt'],
      updateOnDuplicate: ['hasAllDeptAccess', 'departmentAccess', 'displayName', 'storeType', 'updatedAt']
    }
    return user_profile.bulkCreate(model, options)
  } catch (error) {
    logger.error({ error }, 'Error while creating user profile')
    throw new Error(error)
  }
}

exports.getUserProfileDetails = async (type) => {
  try {
    const { user_profile, user_socket_details } = models()
    user_profile.hasMany(user_socket_details, {
      foreignKey: 'username'
    })
    user_socket_details.hasOne(user_profile, {
      foreignKey: 'username'
    })
    return user_profile.findAll({
      where: {
        storeType: type
      },
      include: {
        model: user_socket_details,
        required: true
      }
    })
  } catch (error) {
    logger.error({ error }, 'Error while fetching user profile details')
    throw new Error(error)
  }
}

exports.getUserStateDetails = async (username) => {
  try {
    const { user_profile } = models()
    return user_profile.findOne({
      where: {
        username
      },
      attributes: ['userState'],
      raw: true
    })
  } catch (error) {
    logger.error({ error }, 'Error while fetching user profile details')
    throw new Error(error)
  }
}

exports.updateUserProfileDetails = (model, username) => {
  try {
    const { user_profile } = models()
    const options = {
      where: {
        username
      }
    }
    return user_profile.update(model, options)
  } catch (error) {
    logger.error({ error }, 'Error while updating user profile')
    throw new Error(error)
  }
}

exports.findLock = async (type) => {
  try {
    const { user_profile } = models()
    return user_profile.findAll({
      where: {
        storeType: type,
        hasLock: true
      },
      raw: true
    })
  } catch (error) {
    logger.error({ error }, 'Error while bulk updating user profile')
    throw new Error(error)
  }
}
