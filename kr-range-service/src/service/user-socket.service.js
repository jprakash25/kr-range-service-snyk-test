const { deleteSocketSessionBySocketId } = require('../lib/repositories/user-socket-repository')
const { logger } = require('./logger.service')

const deleteSocketId = async (data) => {
  try {
    return deleteSocketSessionBySocketId(data)
  } catch (err) {
    logger.error(err, 'Error while deleting socket ID')
    throw new Error('Error while deleting socket ID')
  }
}

module.exports = {
  deleteSocketId
}
