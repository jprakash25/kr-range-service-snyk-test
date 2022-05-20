const models = require('./../models')
const { logger } = require('../../service/logger.service')
const db = require('../../db')
const Sequelize = require('sequelize')

exports.bulkCreate = async (departmentModel) => {
  try {
    const { department } = models()
    const options = {
      fields: ['department_code', 'rbu_name', 'rbu_code', 'department_name', 'isValid'],
      updateOnDuplicate: ['isValid']
    }

    return department.bulkCreate(departmentModel, options)
  } catch (error) {
    logger.error({ error }, 'Error while bulk updating department data')
    throw new Error(error)
  }
}

exports.getValidDepartmentData = async () => {

  return db.getDB().query(`
    SELECT
      distinct(p.department_code, p.class_name, p.sub_class_name),
      d.department_code,
      CONCAT(d.department_code, ' ', d.department_name) as department,
      d.rbu_name,
      d.rbu_code,
      p.class_name,
      p.sub_class_name subclass_name,
      CONCAT(p.department_code, ',', p.class_name, ',', p.sub_class_name) as family_id
    FROM department d
    INNER JOIN
      product_info_v2 p ON p.department_code = d.department_code
    WHERE
      d."isValid" = True AND p.is_valid_product = True`,
    { type: Sequelize.QueryTypes.SELECT, raw: true })
}
