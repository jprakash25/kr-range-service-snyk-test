const { logger } = require('../service/logger.service')
const { bulkUpdate } = require('../service/properties.service')
const { logSourceInfo } = require('../config')

class PropertiesController {
  bulkUpdateProperties() {
    return async (req, res) => {
      try {
        bulkUpdate()
        return res.status(200).json({ Message: 'Bulk update of properties started' })
      } catch (error) {
        logger.error({ error, ...logSourceInfo('OTHERS') }, 'Error while bulk updating properties')
        return res.status(400).json({ message: error })
      }
    }
  }
}

module.exports = new PropertiesController()
