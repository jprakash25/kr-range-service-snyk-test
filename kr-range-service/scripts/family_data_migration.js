/* eslint-disable no-async-promise-executor */
const csv = require('fast-csv')
const fs = require('fs')
const path = require('path')
const { pgConnect, pgClose } = require('../src/db')
const { logger } = require('../src/service/logger.service')
const { bulkCreate } = require('../src/lib/repositories/family-data-repository')
const config = require('../src/config')

const insertRows = async (rows) => {
  try {
    await bulkCreate(rows)
  } catch (error) {
    logger.error(error)
  }
}

const parseCSV = async () => {
  return new Promise((resolve, reject) => {
    let csvData = []
    let csvFilePath = path.resolve(config.familyTreePath)
    let stream

    logger.info(`Reading familyTree CSV file from path ${csvFilePath}`)
    stream = fs.createReadStream(path.resolve(config.familyTreePath))

    let csvStream = csv.parse({ headers: true })
      .on('data', function (data) {
        csvData.push(data)
      })
      .on('end', function () {
        resolve(csvData)
      })
      .on('error', function (error) {
        reject(error)
      })

    stream.pipe(csvStream)
  })
}

const main = async () => {
  try {

    let familyData = await parseCSV()
    if (familyData.length > 0) {
      familyData = familyData.map(data => {
        return {
          department_code: data?.DEPARTMENT_NUMBER,
          family_name: data?.FAMILY_NAME?.toUpperCase(),
          family_code: data?.FAMILY_NUMBER,
          class_name: data?.CLASS_NAME?.toUpperCase(),
          class_code: data?.CLASS_NUMBER,
          subclass_name: data?.SUB_CLASS_NAME?.toUpperCase(),
          subclass_code: data?.SUB_CLASS_NUMBER,
          is_valid: data?.VALID == '1' ? true : false
        }
      })

      await pgConnect()
      await insertRows(familyData)
      logger.info('family table insert successful')
      pgClose()
      return true
    } else {
      logger.info('No family data. Quitting the process')
      return 'No data'
    }

  } catch (error) {
    logger.error({ source: config.errorSources.DB }, 'Error in family tree csv = ' + error)
  }
}

main()

module.exports = main
