/* eslint-disable no-async-promise-executor */
const { pgConnect, pgClose } = require('../src/db')
const { logger } = require('../src/service/logger.service')
const { S3 } = require('../src/lib/aws')
const { rangeServiceInputsBucket } = require('../src/config')
const { bulkCreate } = require('../src/lib/repositories/department-data-repository')
const { disabledRBUs } = require('../src/config/tagged-data.js')

const insertRows = async (rows) => {
  try {
    await bulkCreate(rows)
  } catch (error) {
    logger.error(error)
  }
}

const main = async () => {
  try {
    const s3Data = await S3.s3GetObject(rangeServiceInputsBucket, 'rbu/rbu.json').promise()
    let department = JSON.parse(Buffer.from(s3Data.Body).toString())
    department = department.map(data => {
      return {
        rbu_code: data?.rbu_number,
        rbu_name: data?.rbu_name,
        department_code: data?.department_number,
        department_name: data?.department_name,
        isValid: !disabledRBUs.includes(data?.rbu_name)
      }
    })
    await pgConnect()
    await insertRows(department)
    logger.info('department table insert successful')
    pgClose()
  } catch (error) {
    logger.error(error)
  }
}

main()

module.exports = main
