const models = require('./../models')
const { logger } = require('../../service/logger.service')

exports.updateJobStatus = (model) => {
  try {
    const { ipm_job_info } = models()
    const options = {
      fields: ['jobId', 'groupId', 'type', 'status', 'createdAt', 'updatedAt'],
      updateOnDuplicate: ['status', 'updatedAt']
    }
    return ipm_job_info.bulkCreate(model, options)
  } catch (error) {
    logger.error({ error }, 'Error while updating IPM job info')
    throw new Error(error)
  }
}

exports.findProcessingJobs = async (type) => {
  const { ipm_job_info } = models()
  const params = {
    where: {
      status: 'Processing',
      type: type
    },
    attributes: ['jobId'],
    raw: true
  }
  return ipm_job_info.findAll(params)
}
