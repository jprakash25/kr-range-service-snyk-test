const models = require('../models')
const { logger } = require('../../service/logger.service')

exports.deleteSocketSessionBySocketId = async ({ socketId, username }) => {
  const { user_socket_details } = models()
  let option = {}
  if (socketId) {
    option.socketId = socketId
  }
  if (username) {
    option.username = username
  }
  const options = {
    where: option
  }
  return user_socket_details.destroy(options)
}

exports.bulkCreateUserSocket = (model) => {
  try {
    const { user_socket_details } = models()
    const options = {
      fields: ['username', 'socketId', 'createdAt', 'updatedAt'],
      updateOnDuplicate: ['updatedAt']
    }
    return user_socket_details.bulkCreate(model, options)
  } catch (error) {
    logger.error({ error }, 'Error while bulk updating user socket details')
    throw new Error(error)
  }
}
