const { promisify } = require('util')
const { S3 } = require('./lib/aws')
const csvParse = promisify(require('csv-parse'))
const moment = require('moment-timezone')
const { bulkInsertBlacklistWhitelist, truncateTable } = require('./lib/repositories/upload-blacklist-whitelist-repository')
const { findProcessingJobs } = require('./lib/repositories/ipm-job-info-repository')
const { pollIpmJobStatus } = require('./service/tagging.service')

const loadWhiteListBlackList = async () => {
  try {
    const bucket = process.env.RANGE_INPUT_BUCKET_NAME || 'kmartau-dev-range-service-inputs'
    const key = 'upload-whitlelist-blacklist/whitelist-blacklist.csv'
    const whitelistBlacklistObj = await S3.s3GetObject(bucket, key).promise()
    const whitelistBlacklistData = Buffer.from(whitelistBlacklistObj.Body).toString()
    const parsedCSV = await csvParse(whitelistBlacklistData, {
      skip_empty_lines: true,
      skip_lines_with_empty_values: true,
      trim: true,
      columns: true,
      bom: true
    })
    const transformedData = parsedCSV.map((row) => ({
      channel: row['CHANNEL'],
      department: row['DEPARTMENT'],
      family: row['FAMILY'],
      class: row['CLASS'],
      subclass: row['SUBCLASS'],
      subsubclass: row['SUBSUBCLASS'],
      basedOn: row['BASED ON'].toLowerCase(),
      isWhitelisted: row['INCLUDED'] && row['INCLUDED'].toUpperCase() == 'Y' ? true : false,
      isBlacklisted: row['EXCLUDED'] && row['EXCLUDED'].toUpperCase() == 'Y' ? true : false,
      effectiveDate: row['EFFECTIVE DATE'] ? moment(row['EFFECTIVE DATE'], 'DD/MM/YYYY').tz('Australia/Melbourne') : null,
      expiryDate: row['EXPIRY DATE'] ? moment(row['EXPIRY DATE'], 'DD/MM/YYYY').tz('Australia/Melbourne') : moment('31/12/9999', 'DD/MM/YYYY'),
      updatedAt: moment(),
    }))
    await truncateTable()
    console.log('Truncated upload black list white list before seeding')
    await bulkInsertBlacklistWhitelist(transformedData)
    console.log(' upload black list white list seeding completed')
  } catch (error) {
    console.log(error)
  }
}

const getIpmJobStatus = async () => {
  const data = await findProcessingJobs('khub')
  if (data?.length > 0) {
    data.map((d) => {
      pollIpmJobStatus(d.jobId)
    })
  }
}

const startUp = async () => {
  await loadWhiteListBlackList()
  await getIpmJobStatus()
}
module.exports = startUp
