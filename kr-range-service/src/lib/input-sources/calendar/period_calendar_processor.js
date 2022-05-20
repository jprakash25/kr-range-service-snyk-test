const csv = require('fast-csv')
const fs = require('fs')
const path = require('path')
const db = require('../../../db')
const { logger } =  require('../../../service/logger.service')
const requiredPCColumns = require('../../json_schemas/period-calendar-columns.json')
const { truncate, bulkInsert } = require('../../repositories/period-calendar-repository')
const config = require('../../../config')

class PeriodCalendar {

  async parseCSV() {
    return new Promise((resolve, reject) => {
      let csvData = []
      let csvFilePath = path.resolve(config.periodCalendarFilePath)
      let stream

      logger.info(`Reading Period Calendar CSV file from path ${csvFilePath}`)
      stream = fs.createReadStream(path.resolve(config.periodCalendarFilePath))

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

  async parseAndStorePeriodCalendarData() {
    try {
      let pcData = await this.parseCSV()
      if (pcData.length > 0) {
        const valid = this.validatePCData(Object.keys(pcData[0]))
        if (!valid) {
          throw new Error('Certain required columns are not present in the Period Calendar file')
        }
        pcData = this.inputToDbModel(pcData)
        await this.storeToDb(pcData)
        return true
      } else {
        logger.info('No Period Calendar data. Quitting the process')
        return 'No data'
      }
    } catch (error) {
        logger.error({ source: config.errorSources.EXPORT },'Error in seeding period calendar data = '+error)
    }
  }

  getRequiredPCColumns() {
    return requiredPCColumns
  }

  validatePCData(pcColumns) {
    const transformedRequiredPCColumns = this.getRequiredPCColumns().map(column => column.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
    const transformedPCColumns = pcColumns.map(column => column.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
    const columnsNotFound = transformedRequiredPCColumns.filter(column => !transformedPCColumns.includes(column))
    if (columnsNotFound.length == 0) {
      return true
    } else {
      return false
    }
  }

  inputToDbModel(pc_data) {
    return pc_data.map(data => {
        return {
            acc_year: data.ACC_YEAR,
            acc_period: data.ACC_PERIOD,
            acc_week: data.ACC_WEEK,
            acc_start_week_date: data.ACC_START_WEEK_DATE,
            acc_end_week_date: data.ACC_END_WEEK_DATE,
            acc_week_relative: data.ACC_WEEK_RELATIVE,
            acc_quarter: data.ACC_QUARTER,
            gregorian_year: data.GREGORIAN_YEAR,
            gregorian_week: data.GREGORIAN_WEEK,
            pwf: data.PWF
        }
    })
  }

  async storeToDb(pc_data) {
    const sequelize = db.getDB()
    return sequelize.transaction().then(function (t) {
      return truncate(t).then(function () {
        return bulkInsert(pc_data, t)
      }).then(function () {
        return t.commit()
      }).catch(async function (err) {
        await t.rollback()
        throw new Error(`${err}: The transaction was failed and rolled back`)
      })
    })
  }

}

module.exports = new PeriodCalendar()
