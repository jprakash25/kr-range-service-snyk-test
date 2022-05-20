const models = require('./../models')
const { Op } = require('sequelize')
const { logger } = require('../../service/logger.service')

exports.bulkCreate = async (familyModel) => {
  try {
    const { family } = models()
    const options = {
      fields: ['department_code', 'family_name', 'family_code', 'class_name', 'class_code', 'subclass_name', 'subclass_code', 'is_valid'],
      updateOnDuplicate: ['is_valid']
    }
    return family.bulkCreate(familyModel, options)
  } catch (error) {
    logger.error({ error }, 'Error while bulk updating family data')
    throw new Error(error)
  }
}

exports.getFamilyId = async (params) => {
  const { family } = models()
  try {
    return family.findOne({
      attributes: [
        'id'
      ],
      where: {
        [Op.or]: [{
          [Op.and]: [
            { department_code: params.department_code },
            { class_name: params.class_name },
            { subclass_name: params.subclass_name }]
        },
        {
          [Op.and]: [
            { department_code: params.department_code },
            { class_name: '' },
            { subclass_name: '' }]
        }]
      },
      raw: true
    })
  } catch (error) {
    logger.error({ error }, 'Error while getting family id')
    throw new Error(error)
  }
}
